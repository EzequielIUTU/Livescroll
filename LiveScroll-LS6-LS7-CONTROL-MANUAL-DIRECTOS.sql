-- LiveScroll 6 + 7 · Control manual de Kick, Twitch, YouTube y TikTok
-- Ejecutar una sola vez en Supabase SQL Editor.
BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS kick_is_live boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS twitch_is_live boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS kick_live_until timestamptz,
  ADD COLUMN IF NOT EXISTS twitch_live_until timestamptz,
  ADD COLUMN IF NOT EXISTS youtube_live_until timestamptz;

UPDATE public.profiles
SET kick_is_live = kick_is_live OR (is_live=true AND lower(coalesce(live_platform,'')) IN ('kick','both')),
    twitch_is_live = twitch_is_live OR (is_live=true AND lower(coalesce(live_platform,'')) IN ('twitch','both'));

CREATE OR REPLACE FUNCTION public.set_my_social_live(p_platform text,p_live boolean,p_profile_url text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  v_id uuid:=auth.uid(); v_creator boolean;
  v_platform text:=lower(btrim(coalesce(p_platform,'')));
  v_url text:=nullif(btrim(p_profile_url),'');
  v_kick boolean; v_twitch boolean; v_youtube boolean; v_tiktok boolean;
  v_live_platform text;
BEGIN
  IF v_id IS NULL THEN RETURN jsonb_build_object('ok',false,'error','not_authenticated'); END IF;
  IF v_platform NOT IN ('kick','twitch','youtube','tiktok') THEN
    RETURN jsonb_build_object('ok',false,'error','invalid_platform');
  END IF;

  SELECT is_creator,kick_is_live,twitch_is_live,youtube_is_live,tiktok_is_live
  INTO v_creator,v_kick,v_twitch,v_youtube,v_tiktok
  FROM public.profiles WHERE id=v_id;
  IF coalesce(v_creator,false) IS NOT TRUE THEN
    RETURN jsonb_build_object('ok',false,'error','creator_required');
  END IF;

  IF p_live AND v_platform='kick' AND (v_url IS NULL OR v_url !~* '^https://([a-z0-9-]+\.)?kick\.com/') THEN
    RETURN jsonb_build_object('ok',false,'error','invalid_kick_url');
  END IF;
  IF p_live AND v_platform='twitch' AND (v_url IS NULL OR v_url !~* '^https://([a-z0-9-]+\.)?twitch\.tv/') THEN
    RETURN jsonb_build_object('ok',false,'error','invalid_twitch_url');
  END IF;
  IF p_live AND v_platform='youtube' AND (v_url IS NULL OR v_url !~* '^https://([a-z0-9-]+\.)?(youtube\.com|youtu\.be)/') THEN
    RETURN jsonb_build_object('ok',false,'error','invalid_youtube_url');
  END IF;
  IF p_live AND v_platform='tiktok' AND (v_url IS NULL OR v_url !~* '^https://([a-z0-9-]+\.)?tiktok\.com/') THEN
    RETURN jsonb_build_object('ok',false,'error','invalid_tiktok_url');
  END IF;

  v_kick:=CASE WHEN v_platform='kick' THEN p_live ELSE coalesce(v_kick,false) END;
  v_twitch:=CASE WHEN v_platform='twitch' THEN p_live ELSE coalesce(v_twitch,false) END;
  v_youtube:=CASE WHEN v_platform='youtube' THEN p_live ELSE coalesce(v_youtube,false) END;
  v_tiktok:=CASE WHEN v_platform='tiktok' THEN p_live ELSE coalesce(v_tiktok,false) END;
  v_live_platform:=nullif(concat_ws('+',
    CASE WHEN v_kick THEN 'kick' END, CASE WHEN v_twitch THEN 'twitch' END,
    CASE WHEN v_youtube THEN 'youtube' END, CASE WHEN v_tiktok THEN 'tiktok' END),'');

  UPDATE public.profiles SET
    social_kick=CASE WHEN v_platform='kick' THEN coalesce(v_url,social_kick) ELSE social_kick END,
    social_twitch=CASE WHEN v_platform='twitch' THEN coalesce(v_url,social_twitch) ELSE social_twitch END,
    social_youtube=CASE WHEN v_platform='youtube' THEN coalesce(v_url,social_youtube) ELSE social_youtube END,
    social_tiktok=CASE WHEN v_platform='tiktok' THEN coalesce(v_url,social_tiktok) ELSE social_tiktok END,
    kick_is_live=v_kick,twitch_is_live=v_twitch,youtube_is_live=v_youtube,tiktok_is_live=v_tiktok,
    is_live=v_kick OR v_twitch,live_platform=v_live_platform,
    kick_live_until=CASE WHEN v_platform='kick' AND p_live THEN now()+interval '4 hours' WHEN v_platform='kick' THEN NULL ELSE kick_live_until END,
    twitch_live_until=CASE WHEN v_platform='twitch' AND p_live THEN now()+interval '4 hours' WHEN v_platform='twitch' THEN NULL ELSE twitch_live_until END,
    youtube_live_until=CASE WHEN v_platform='youtube' AND p_live THEN now()+interval '4 hours' WHEN v_platform='youtube' THEN NULL ELSE youtube_live_until END,
    tiktok_live_until=CASE WHEN v_platform='tiktok' AND p_live THEN now()+interval '4 hours' WHEN v_platform='tiktok' THEN NULL ELSE tiktok_live_until END,
    youtube_live_video_id=CASE WHEN v_platform='youtube' THEN NULL ELSE youtube_live_video_id END,
    live_started_at=CASE WHEN p_live THEN now() ELSE live_started_at END
  WHERE id=v_id;
  RETURN jsonb_build_object('ok',true,'platform',v_platform,'live',p_live,'live_platform',v_live_platform);
END;
$$;

REVOKE ALL ON FUNCTION public.set_my_social_live(text,boolean,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_my_social_live(text,boolean,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.expire_manual_social_lives()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_count integer;
BEGIN
  WITH calculated AS (
    SELECT id,
      CASE WHEN kick_live_until<=now() THEN false ELSE kick_is_live END k,
      CASE WHEN twitch_live_until<=now() THEN false ELSE twitch_is_live END tw,
      CASE WHEN youtube_live_until<=now() THEN false ELSE youtube_is_live END yt,
      CASE WHEN tiktok_live_until<=now() THEN false ELSE tiktok_is_live END tt
    FROM public.profiles
    WHERE (kick_is_live AND kick_live_until<=now()) OR (twitch_is_live AND twitch_live_until<=now())
       OR (youtube_is_live AND youtube_live_until<=now()) OR (tiktok_is_live AND tiktok_live_until<=now())
  )
  UPDATE public.profiles p SET
    kick_is_live=c.k,twitch_is_live=c.tw,youtube_is_live=c.yt,tiktok_is_live=c.tt,
    is_live=c.k OR c.tw,
    live_platform=nullif(concat_ws('+',CASE WHEN c.k THEN 'kick' END,CASE WHEN c.tw THEN 'twitch' END,CASE WHEN c.yt THEN 'youtube' END,CASE WHEN c.tt THEN 'tiktok' END),''),
    kick_live_until=CASE WHEN NOT c.k THEN NULL ELSE kick_live_until END,
    twitch_live_until=CASE WHEN NOT c.tw THEN NULL ELSE twitch_live_until END,
    youtube_live_until=CASE WHEN NOT c.yt THEN NULL ELSE youtube_live_until END,
    tiktok_live_until=CASE WHEN NOT c.tt THEN NULL ELSE tiktok_live_until END
  FROM calculated c WHERE p.id=c.id;
  GET DIAGNOSTICS v_count=ROW_COUNT;
  RETURN v_count;
END;
$$;

DO $$
DECLARE v_job record;
BEGIN
  FOR v_job IN SELECT jobid FROM cron.job WHERE jobname='expire-manual-social-lives' LOOP
    PERFORM cron.unschedule(v_job.jobid);
  END LOOP;
  PERFORM cron.schedule('expire-manual-social-lives','*/5 * * * *','select public.expire_manual_social_lives();');
END;
$$;

COMMIT;
SELECT public.expire_manual_social_lives() AS directos_manuales_vencidos;
