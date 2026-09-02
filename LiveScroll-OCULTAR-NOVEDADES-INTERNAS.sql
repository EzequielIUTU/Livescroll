-- LiveScroll · Limpieza de textos públicos
-- No modifica funciones ni controles administrativos.

begin;

update public.changelog_entries
set content='La experiencia compartida entre generaciones ahora conserva mejor la identidad y el estado de la cuenta.'
where display_version='6.2.4'
  and content='El Panel de Admin incorpora la ficha moderna de usuarios y controles compartidos.';

update public.changelog_entries
set content='La identidad y el estado de la cuenta se mantienen sincronizados entre generaciones.'
where display_version='7.0.9'
  and content='La identidad, la cuenta y el Panel de Admin se mantienen sincronizados entre generaciones.';

commit;

select version,display_version,category,content
from public.changelog_entries
where display_version in ('6.2.4','7.0.9')
order by version,category,content;
