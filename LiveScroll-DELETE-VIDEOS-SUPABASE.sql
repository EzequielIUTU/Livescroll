-- ============================================================
-- LiveScroll · BORRADO REAL DE VIDEOS ANTIGUOS EN SUPABASE
--
-- Permite borrar objetos del bucket clip-videos únicamente a:
--   1) el dueño de la carpeta <user_id>/...
--   2) un administrador registrado en public.profiles
--
-- Es seguro volver a ejecutar este archivo.
-- ============================================================

BEGIN;

DROP POLICY IF EXISTS "LiveScroll borra videos propios o admin" ON storage.objects;

CREATE POLICY "LiveScroll borra videos propios o admin"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'clip-videos'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1
      FROM public.profiles AS profile
      WHERE profile.id = auth.uid()
        AND COALESCE(profile.is_admin, false) = true
    )
  )
);

COMMIT;

-- Verificación: debe devolver una sola fila con cmd = DELETE.
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname = 'LiveScroll borra videos propios o admin';
