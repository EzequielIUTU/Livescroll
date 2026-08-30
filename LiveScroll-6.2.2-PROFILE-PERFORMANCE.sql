-- ============================================================
-- LiveScroll 6.2.2 · PROFILE PERFORMANCE
-- Solo publica LiveScroll 6. LiveScroll 7 no se modifica.
-- Ejecutar después de que Vercel publique app.js, index.html y los SVG.
-- ============================================================

BEGIN;

INSERT INTO public.app_config(key,value) VALUES
  ('ls6_required_build',60202)
ON CONFLICT (key) DO UPDATE SET value=excluded.value;

DO $$
DECLARE
  v_version integer;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.changelog_entries WHERE display_version='6.2.2') THEN
    SELECT coalesce(max(version),0)+1 INTO v_version FROM public.changelog_entries;
    INSERT INTO public.changelog_entries(version,display_version,category,content) VALUES
      (v_version,'6.2.2','actualizado','El perfil solicita solamente los datos necesarios de cada video para cargar con mayor rapidez y consumir menos conexión.'),
      (v_version,'6.2.2','actualizado','Los logos de Kick, Twitch, YouTube, TikTok e Instagram ahora forman parte de LiveScroll 6 y continúan visibles con conexión inestable.'),
      (v_version,'6.2.2','actualizado','La caché de la aplicación fue renovada para activar inmediatamente las mejoras de PROFILE PERFORMANCE.');
  END IF;
END;
$$;

SELECT set_config(
  'request.jwt.claim.sub',
  (SELECT id::text FROM public.profiles WHERE is_admin IS TRUE ORDER BY created_at ASC LIMIT 1),
  true
);
SELECT set_config('request.jwt.claim.role','authenticated',true);
SELECT public.admin_bump_content_version('changelog') AS publicar_profile_performance;

COMMIT;

SELECT key,value FROM public.app_config
WHERE key='ls6_required_build';
