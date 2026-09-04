-- ============================================================
-- LiveScroll · DIAGNÓSTICO DE ESPACIO EN SUPABASE
-- SOLO LECTURA: no elimina ni modifica datos de LiveScroll.
-- Ejecutar completo en Supabase SQL Editor.
-- ============================================================

-- 1. Tamaño total actual de la base.
select
  current_database() as base,
  pg_size_pretty(pg_database_size(current_database())) as espacio_total;

-- 2. Espacio usado por cada esquema.
select
  n.nspname as esquema,
  pg_size_pretty(sum(pg_total_relation_size(c.oid))) as espacio_total
from pg_class c
join pg_namespace n on n.oid=c.relnamespace
where c.relkind in ('r','m')
  and n.nspname not in ('pg_catalog','information_schema','pg_toast')
group by n.nspname
order by sum(pg_total_relation_size(c.oid)) desc;

-- 3. Tablas más pesadas, índices y cantidad estimada de filas.
select
  s.schemaname as esquema,
  s.relname as tabla,
  s.n_live_tup as filas_activas_estimadas,
  s.n_dead_tup as filas_muertas_estimadas,
  pg_size_pretty(pg_total_relation_size(s.relid)) as espacio_total,
  pg_size_pretty(pg_relation_size(s.relid)) as datos,
  pg_size_pretty(pg_indexes_size(s.relid)) as indices,
  pg_total_relation_size(s.relid) as bytes_totales
from pg_stat_user_tables s
order by pg_total_relation_size(s.relid) desc;

-- 4. Tablas con mayor proporción de filas muertas.
-- Estas filas no son datos visibles: PostgreSQL puede recuperarlas con mantenimiento.
select
  schemaname as esquema,
  relname as tabla,
  n_live_tup as filas_activas_estimadas,
  n_dead_tup as filas_muertas_estimadas,
  round(100.0*n_dead_tup/greatest(n_live_tup+n_dead_tup,1),2) as porcentaje_muerto,
  last_autovacuum,
  last_autoanalyze
from pg_stat_user_tables
where n_dead_tup>0
order by porcentaje_muerto desc, n_dead_tup desc;

-- 5. Antigüedad de registros en todas las tablas que tengan created_at.
-- Solo crea una tabla TEMPORAL que desaparece al terminar la sesión.
create temporary table if not exists ls_space_age_report(
  esquema text,
  tabla text,
  total bigint,
  mas_de_30_dias bigint,
  mas_de_90_dias bigint,
  mas_de_180_dias bigint,
  registro_mas_antiguo timestamptz
) on commit preserve rows;

truncate table ls_space_age_report;

do $$
declare
  r record;
begin
  for r in
    select table_schema,table_name
    from information_schema.columns
    where table_schema in ('public','storage')
      and column_name='created_at'
      and data_type in ('timestamp with time zone','timestamp without time zone','date')
  loop
    execute format(
      'insert into ls_space_age_report
       select %L,%L,count(*),
       count(*) filter(where created_at<now()-interval ''30 days''),
       count(*) filter(where created_at<now()-interval ''90 days''),
       count(*) filter(where created_at<now()-interval ''180 days''),
       min(created_at)::timestamptz from %I.%I',
      r.table_schema,r.table_name,r.table_schema,r.table_name
    );
  end loop;
end;
$$;

select *
from ls_space_age_report
order by total desc, esquema, tabla;

-- 6. Tamaño lógico de los archivos de Storage por bucket.
select
  bucket_id as bucket,
  count(*) as archivos,
  pg_size_pretty(sum(
    case
      when coalesce(metadata->>'size','') ~ '^[0-9]+$'
      then (metadata->>'size')::bigint
      else 0
    end
  )) as tamaño_archivos,
  sum(
    case
      when coalesce(metadata->>'size','') ~ '^[0-9]+$'
      then (metadata->>'size')::bigint
      else 0
    end
  ) as bytes_archivos
from storage.objects
group by bucket_id
order by bytes_archivos desc;

-- 7. Los 50 archivos más grandes de Storage.
select
  bucket_id as bucket,
  name as archivo,
  pg_size_pretty(
    case
      when coalesce(metadata->>'size','') ~ '^[0-9]+$'
      then (metadata->>'size')::bigint
      else 0
    end
  ) as tamaño,
  created_at,
  updated_at
from storage.objects
order by
  case
    when coalesce(metadata->>'size','') ~ '^[0-9]+$'
    then (metadata->>'size')::bigint
    else 0
  end desc
limit 50;

-- 8. Índices grandes que registran cero lecturas desde el último reinicio de estadísticas.
-- No significa automáticamente que deban borrarse: es solo una señal para revisar.
select
  schemaname as esquema,
  relname as tabla,
  indexrelname as indice,
  idx_scan as lecturas,
  pg_size_pretty(pg_relation_size(indexrelid)) as tamaño
from pg_stat_user_indexes
where idx_scan=0
order by pg_relation_size(indexrelid) desc;

-- 9. Columnas relacionadas con archivos, videos o enlaces.
-- Sirve para preparar luego una búsqueda segura de archivos huérfanos.
select
  table_schema as esquema,
  table_name as tabla,
  column_name as columna,
  data_type as tipo
from information_schema.columns
where table_schema='public'
  and (
    column_name ilike '%url%' or
    column_name ilike '%video%' or
    column_name ilike '%file%' or
    column_name ilike '%media%' or
    column_name ilike '%avatar%' or
    column_name ilike '%cover%' or
    column_name ilike '%background%'
  )
order by table_name,column_name;

-- FIN. Este archivo no ejecuta DELETE, DROP, UPDATE ni cambios persistentes.
