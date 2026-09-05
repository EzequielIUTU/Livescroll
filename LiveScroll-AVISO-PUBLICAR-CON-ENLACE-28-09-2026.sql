-- ============================================================
-- LiveScroll · AVISO PREVIO · PUBLICAR CON ENLACE
-- Fecha del cambio: 28/09/2026
-- Solo publica la novedad. Todavía no modifica la subida de videos.
-- Categorías compatibles: nuevo / actualizado / reparado.
-- ============================================================

begin;

do $$
declare
  v_version integer;
begin
  if not exists (
    select 1 from public.changelog_entries
    where display_version='6.2.5'
  ) then
    select coalesce(max(version),0)+1
    into v_version
    from public.changelog_entries;

    insert into public.changelog_entries
      (version,display_version,category,content)
    values
      (v_version,'6.2.5','nuevo','El 28/09/2026 llegará una forma más moderna, rápida y sencilla de compartir videos en LiveScroll.'),
      (v_version,'6.2.5','actualizado','Las nuevas publicaciones mediante archivos MP4 y MKV serán reemplazadas por un único campo de enlace compatible con YouTube, Kick, Twitch y TikTok.'),
      (v_version,'6.2.5','actualizado','Los videos que ya fueron publicados continuarán disponibles y no serán eliminados por este cambio.'),
      (v_version,'6.2.5','actualizado','Sabemos que modificar una función conocida puede ocasionar molestias y pedimos disculpas. Este paso es necesario para mantener LiveScroll estable y seguir construyendo el proyecto.'),
      (v_version,'6.2.5','nuevo','Muy pronto solo tendrás que pegar tu enlace: LiveScroll reconocerá la plataforma y preparará la publicación por vos.');
  end if;

  if not exists (
    select 1 from public.changelog_entries
    where display_version='7.0.10'
  ) then
    select coalesce(max(version),0)+1
    into v_version
    from public.changelog_entries;

    insert into public.changelog_entries
      (version,display_version,category,content)
    values
      (v_version,'7.0.10','nuevo','El 28/09/2026 llegará una forma más moderna, rápida y sencilla de compartir videos en LiveScroll.'),
      (v_version,'7.0.10','actualizado','Las nuevas publicaciones mediante archivos MP4 y MKV serán reemplazadas por un único campo de enlace compatible con YouTube, Kick, Twitch y TikTok.'),
      (v_version,'7.0.10','actualizado','Los videos que ya fueron publicados continuarán disponibles y no serán eliminados por este cambio.'),
      (v_version,'7.0.10','actualizado','Sabemos que modificar una función conocida puede ocasionar molestias y pedimos disculpas. Este paso es necesario para mantener LiveScroll estable y seguir construyendo el proyecto.'),
      (v_version,'7.0.10','nuevo','Muy pronto solo tendrás que pegar tu enlace: LiveScroll reconocerá la plataforma y preparará la publicación por vos.');
  end if;
end;
$$;

commit;

select version,display_version,category,content
from public.changelog_entries
where display_version in ('6.2.5','7.0.10')
order by version,
  case category when 'nuevo' then 1 when 'actualizado' then 2 when 'reparado' then 3 else 4 end,
  content;
