-- ============================================================
-- LiveScroll 6.2.3 · CREATOR PROGRAM
-- Publica las nuevas funciones del Programa de Creadores.
-- Ejecutar después de probar el panel Admin y los perfiles.
-- ============================================================

BEGIN;

INSERT INTO public.app_config(key,value) VALUES
  ('ls6_required_build',60203)
ON CONFLICT (key) DO UPDATE SET value=excluded.value;

DO $$
DECLARE
  v_version integer;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.changelog_entries WHERE display_version='6.2.3') THEN
    SELECT coalesce(max(version),0)+1 INTO v_version FROM public.changelog_entries;
    INSERT INTO public.changelog_entries(version,display_version,category,content) VALUES
      (v_version,'6.2.3','nuevo','Llega el Programa de Creadores de LiveScroll con términos y condiciones propios para solicitar el ingreso formal.'),
      (v_version,'6.2.3','nuevo','Los creadores aceptados reciben la insignia exclusiva VERIFICADO, visible automáticamente junto a su nombre y dentro de su perfil.'),
      (v_version,'6.2.3','nuevo','El Panel de Admin incorpora fecha y hora de registro, antigüedad detallada y controles separados para otorgar acceso de Creador o aceptar al Programa.'),
      (v_version,'6.2.3','nuevo','El directorio separa Usuarios y Creadores para descubrir perfiles según su nivel de acceso.');
  END IF;
END;
$$;

SELECT set_config(
  'request.jwt.claim.sub',
  (SELECT id::text FROM public.profiles WHERE is_admin IS TRUE ORDER BY created_at ASC LIMIT 1),
  true
);
SELECT set_config('request.jwt.claim.role','authenticated',true);
SELECT public.admin_bump_content_version('changelog') AS publicar_creator_program;

COMMIT;

SELECT key,value FROM public.app_config
WHERE key='ls6_required_build';
