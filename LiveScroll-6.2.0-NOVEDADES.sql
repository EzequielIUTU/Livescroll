-- ============================================================
-- LiveScroll 6.2.0 · RENDIMIENTO Y CUENTAS CONECTADAS
-- NOVEDADES
--
-- Ejecutar una sola vez en Supabase > SQL Editor.
-- Después: Admin > Novedades > Subir versión de Novedades.
-- ============================================================

BEGIN;

DO $$
DECLARE
  v_version integer;
BEGIN
  DELETE FROM public.changelog_entries
  WHERE display_version = '6.2.0';

  SELECT COALESCE(MAX(version), 0) + 1
  INTO v_version
  FROM public.changelog_entries;

  INSERT INTO public.changelog_entries
    (version, display_version, category, content)
  VALUES
    (v_version, '6.2.0', 'nuevo',
      'Kick y Twitch conectados ahora pueden mostrar automáticamente la cuenta oficial en el perfil.'),
    (v_version, '6.2.0', 'nuevo',
      'LiveScroll 6 estrena un ícono propio para diferenciarse claramente de LiveScroll 7.'),
    (v_version, '6.2.0', 'actualizado',
      'Legacy carga miniaturas de manera más liviana y mantiene menos videos activos para responder mejor en celulares antiguos.'),
    (v_version, '6.2.0', 'actualizado',
      'Nova administra mejor la memoria, los efectos y la precarga para ofrecer mayor fluidez y estabilidad.'),
    (v_version, '6.2.0', 'actualizado',
      'El enlace escrito manualmente de Kick o Twitch queda como una alternativa secundaria y opcional.'),
    (v_version, '6.2.0', 'reparado',
      'Se corrigió el caso en que un video podía reproducir sonido antes de mostrar correctamente la imagen.'),
    (v_version, '6.2.0', 'reparado',
      'Las categorías del historial ahora aparecen una sola vez por versión y agrupan todos sus cambios.'),
    (v_version, '6.2.0', 'reparado',
      'Se corrigió la detección de Legacy en tareas de precarga para evitar trabajo innecesario en dispositivos limitados.');
END $$;

COMMIT;

SELECT version, display_version, category, content
FROM public.changelog_entries
WHERE display_version = '6.2.0'
ORDER BY
  CASE category
    WHEN 'nuevo' THEN 1
    WHEN 'actualizado' THEN 2
    WHEN 'reparado' THEN 3
    ELSE 4
  END,
  content;
