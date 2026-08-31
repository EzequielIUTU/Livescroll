-- LiveScroll 6 + 7 · Control manual visible de YouTube y TikTok
-- Ejecutar una sola vez en Supabase SQL Editor.
BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS youtube_live_until timestamptz;

CREATE OR REPLACE FUNCTION public.set_my_social_live(
  p_platform text,
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
  v_platform text := lower(btrim(coalesce(p_platform,'')));
  v_url text := nullif(btrim(p_profile_url), '');
BEGIN
  IF v_id IS NULL THEN
    RETURN jsonb_build_object('ok',false,'error','not_authenticated');
  END IF;
  IF v_platform NOT IN ('youtube','tiktok') THEN
    RETURN jsonb_build_object('ok',false,'error','invalid_platform');
  END IF;

  SELECT is_creator INTO v_creator FROM public.profiles WHERE id=v_id;
  IF coalesce(v_creator,false) IS NOT TRUE THEN
    RETURN jsonb_build_object('ok',false,'error','creator_required');
  END IF;

  IF p_live AND v_platform='youtube'
     AND (v_url IS NULL OR v_url !~* '^https://([a-z0-9-]+\.)?(youtube\.com|youtu\.be)/') THEN
    RETURN jsonb_build_object('ok',false,'error','invalid_youtube_url');
  END IF;
  IF p_live AND v_platform='tiktok'
     AND (v_url IS NULL OR v_url !~* '^https://([a-z0-9-]+\.)?tiktok\.com/') THEN
    RETURN jsonb_build_object('ok',false,'error','invalid_tiktok_url');
  END IF;

  UPDATE public.profiles
  SET social_youtube = CASE WHEN v_platform='youtube' THEN coalesce(v_url,social_youtube) ELSE social_youtube END,
      social_tiktok = CASE WHEN v_platform='tiktok' THEN coalesce(v_url,social_tiktok) ELSE social_tiktok END,
      youtube_is_live = CASE WHEN v_platform='youtube' THEN p_live ELSE youtube_is_live END,
      youtube_live_video_id = CASE WHEN v_platform='youtube' THEN NULL ELSE youtube_live_video_id END,
      youtube_live_until = CASE WHEN v_platform='youtube' AND p_live THEN now()+interval '4 hours'
                                WHEN v_platform='youtube' THEN NULL ELSE youtube_live_until END,
      tiktok_is_live = CASE WHEN v_platform='tiktok' THEN p_live ELSE tiktok_is_live END,
      tiktok_live_until = CASE WHEN v_platform='tiktok' AND p_live THEN now()+interval '4 hours'
                               WHEN v_platform='tiktok' THEN NULL ELSE tiktok_live_until END,
      live_started_at = CASE WHEN p_live THEN now() ELSE live_started_at END
  WHERE id=v_id;

  RETURN jsonb_build_object('ok',true,'platform',v_platform,'live',p_live);
END;
$$;

REVOKE ALL ON FUNCTION public.set_my_social_live(text,boolean,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_my_social_live(text,boolean,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.expire_manual_social_lives()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_count integer;
BEGIN
  UPDATE public.profiles
  SET youtube_is_live = CASE WHEN youtube_live_until <= now() THEN false ELSE youtube_is_live END,
      youtube_live_until = CASE WHEN youtube_live_until <= now() THEN NULL ELSE youtube_live_until END,
      tiktok_is_live = CASE WHEN tiktok_live_until <= now() THEN false ELSE tiktok_is_live END,
      tiktok_live_until = CASE WHEN tiktok_live_until <= now() THEN NULL ELSE tiktok_live_until END
  WHERE (youtube_is_live=true AND youtube_live_until <= now())
     OR (tiktok_is_live=true AND tiktok_live_until <= now());
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

COMMIT;

SELECT public.expire_manual_social_lives() AS directos_manuales_vencidos;
