-- ============================================================
-- LiveScroll 6.2.4 + LiveScroll 7.0.9 · SHARED CORE
-- Novedades de la unificación de generaciones.
-- No exige reiniciar la APK ni modifica el acceso de versiones.
-- ============================================================

begin;

do $$
declare
  v_version integer;
begin
  if not exists (select 1 from public.changelog_entries where display_version='6.2.4') then
    select coalesce(max(version),0)+1 into v_version from public.changelog_entries;
    insert into public.changelog_entries(version,display_version,category,content) values
      (v_version,'6.2.4','nuevo','LiveScroll Shared Core reúne LS6, LS7 y LS8 dentro de una sola aplicación.'),
      (v_version,'6.2.4','nuevo','El nuevo selector permite elegir la generación antes de reproducir su entrada oficial.'),
      (v_version,'6.2.4','actualizado','Novedades ahora vive junto al selector y avisa con un punto cuando existen cambios sin mirar.'),
      (v_version,'6.2.4','actualizado','El Panel de Admin incorpora la ficha moderna de usuarios y controles compartidos.'),
      (v_version,'6.2.4','reparado','Se retiró el reinicio heredado de actualizaciones para conservar la pantalla y la sesión.'),
      (v_version,'6.2.4','reparado','Mejoras internas de estabilidad, limpieza de reproducción y seguridad web.');
  end if;

  if not exists (select 1 from public.changelog_entries where display_version='7.0.9') then
    select coalesce(max(version),0)+1 into v_version from public.changelog_entries;
    insert into public.changelog_entries(version,display_version,category,content) values
      (v_version,'7.0.9','nuevo','LiveScroll 7 forma parte de Shared Core y se abre desde el selector de generaciones.'),
      (v_version,'7.0.9','actualizado','La identidad, la cuenta y el Panel de Admin se mantienen sincronizados entre generaciones.'),
      (v_version,'7.0.9','actualizado','Novedades se consulta antes de entrar y recuerda individualmente lo que ya fue visto.'),
      (v_version,'7.0.9','reparado','Se eliminó el flujo de reinicio antiguo y se reforzó la limpieza de videos al salir.'),
      (v_version,'7.0.9','reparado','Seguridad Mejorada y Arreglos Internos para la etapa Shared Core.');
  end if;
end;
$$;

commit;

select display_version,category,content
from public.changelog_entries
where display_version in ('6.2.4','7.0.9')
order by version,created_at;
