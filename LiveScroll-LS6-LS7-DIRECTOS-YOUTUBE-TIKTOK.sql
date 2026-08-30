-- LiveScroll 6 + 7 · Directos YouTube automático + TikTok manual
BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS youtube_is_live boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS youtube_channel_id text,
  ADD COLUMN IF NOT EXISTS youtube_live_video_id text,
  ADD COLUMN IF NOT EXISTS tiktok_is_live boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tiktok_live_until timestamptz;

GRANT SELECT (youtube_is_live, youtube_channel_id, youtube_live_video_id, tiktok_is_live, tiktok_live_until)
ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.set_my_tiktok_live(
  p_live boolean,
  p_profile_url text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid := auth.uid();
  v_creator boolean;
  v_url text := nullif(btrim(p_profile_url), '');
BEGIN
  IF v_id IS NULL THEN RETURN jsonb_build_object('ok',false,'error','not_authenticated'); END IF;
  SELECT is_creator INTO v_creator FROM public.profiles WHERE id=v_id;
  IF coalesce(v_creator,false) IS NOT TRUE THEN
    RETURN jsonb_build_object('ok',false,'error','creator_required');
  END IF;
  IF p_live AND (v_url IS NULL OR v_url !~* '^https://([a-z0-9-]+\.)?tiktok\.com/') THEN
    RETURN jsonb_build_object('ok',false,'error','invalid_tiktok_url');
  END IF;

  UPDATE public.profiles
  SET social_tiktok=coalesce(v_url,social_tiktok),
      tiktok_is_live=p_live,
      tiktok_live_until=CASE WHEN p_live THEN now()+interval '4 hours' ELSE NULL END,
      live_started_at=CASE WHEN p_live AND NOT tiktok_is_live THEN now() ELSE live_started_at END
  WHERE id=v_id;
  RETURN jsonb_build_object('ok',true,'live',p_live);
END;
$$;
REVOKE ALL ON FUNCTION public.set_my_tiktok_live(boolean,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_my_tiktok_live(boolean,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.expire_manual_tiktok_lives()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_count integer;
BEGIN
  UPDATE public.profiles SET tiktok_is_live=false,tiktok_live_until=NULL
  WHERE tiktok_is_live=true AND tiktok_live_until <= now();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_followers_new_social_live()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_platform text;
BEGIN
  IF NEW.youtube_is_live AND NOT OLD.youtube_is_live THEN v_platform := 'YouTube';
  ELSIF NEW.tiktok_is_live AND NOT OLD.tiktok_is_live THEN v_platform := 'TikTok';
  ELSE RETURN NEW;
  END IF;

  INSERT INTO public.notifications(user_id,type,message,actor_id)
  SELECT p.id,'live','@'||NEW.username||' inició un directo en '||v_platform||'. Tocá para mirar.',NEW.id
  FROM public.profiles p
  WHERE p.ban_reason IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n
      WHERE n.user_id=p.id AND n.type='live' AND n.actor_id=NEW.id
        AND n.created_at > now()-interval '30 minutes'
    );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_notify_social_live ON public.profiles;
CREATE TRIGGER profiles_notify_social_live
AFTER UPDATE OF youtube_is_live,tiktok_is_live ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.notify_followers_new_social_live();

COMMIT;

SELECT public.expire_manual_tiktok_lives() AS tiktok_vencidos;
