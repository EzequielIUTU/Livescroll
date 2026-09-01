-- LiveScroll 8 · Eliminación de cuenta V4
-- Limpia dependencias directas de profiles.id sin modificar el esquema compartido.

begin;

drop function if exists public.admin_delete_account_ls8(uuid);

create function public.admin_delete_account_ls8(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_username text;
  v_dependency record;
begin
  perform public.ls8_require_admin();
  if p_user_id is null then return jsonb_build_object('ok',false,'error','invalid_user'); end if;
  if p_user_id=auth.uid() then return jsonb_build_object('ok',false,'error','cannot_delete_self'); end if;

  select username into v_username from public.profiles where id=p_user_id;
  if not found and not exists(select 1 from auth.users where id=p_user_id) then
    return jsonb_build_object('ok',false,'error','user_not_found');
  end if;

  -- Borra filas de todas las FK simples que apuntan directamente a profiles.id.
  -- No altera constraints ni comportamiento de LS6/LS7.
  for v_dependency in
    select n.nspname as schema_name,c.relname as table_name,a.attname as column_name
    from pg_constraint fk
    join pg_class c on c.oid=fk.conrelid
    join pg_namespace n on n.oid=c.relnamespace
    join pg_attribute a on a.attrelid=fk.conrelid and a.attnum=fk.conkey[1]
    join pg_attribute referenced on referenced.attrelid=fk.confrelid and referenced.attnum=fk.confkey[1]
    where fk.contype='f'
      and fk.confrelid='public.profiles'::regclass
      and array_length(fk.conkey,1)=1
      and referenced.attname='id'
      and not (n.nspname='public' and c.relname='profiles')
  loop
    execute format('delete from %I.%I where %I=$1',v_dependency.schema_name,v_dependency.table_name,v_dependency.column_name)
      using p_user_id;
  end loop;

  delete from public.profiles where id=p_user_id;
  delete from auth.users where id=p_user_id;
  return jsonb_build_object('ok',true,'username',v_username);
exception
  when foreign_key_violation then return jsonb_build_object('ok',false,'error','nested_related_data','detail',sqlerrm);
  when others then return jsonb_build_object('ok',false,'error','delete_failed','detail',sqlerrm);
end;
$$;

revoke all on function public.admin_delete_account_ls8(uuid) from public, anon;
grant execute on function public.admin_delete_account_ls8(uuid) to authenticated;

commit;
