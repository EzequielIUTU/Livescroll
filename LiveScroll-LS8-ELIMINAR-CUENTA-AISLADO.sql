-- LiveScroll 8 · Eliminación administrativa aislada
-- No modifica admin_delete_account ni ninguna función utilizada por LS6/LS7.

begin;

create or replace function public.admin_delete_account_ls8(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare v_username text;
begin
  perform public.ls8_require_admin();
  if p_user_id is null then return jsonb_build_object('ok',false,'error','invalid_user'); end if;
  if p_user_id=auth.uid() then return jsonb_build_object('ok',false,'error','cannot_delete_self'); end if;

  select username into v_username from public.profiles where id=p_user_id;
  if not found and not exists(select 1 from auth.users where id=p_user_id) then
    return jsonb_build_object('ok',false,'error','user_not_found');
  end if;

  delete from public.profiles where id=p_user_id;
  delete from auth.users where id=p_user_id;
  return jsonb_build_object('ok',true,'username',v_username);
exception
  when foreign_key_violation then return jsonb_build_object('ok',false,'error','related_data_blocked','detail',sqlerrm);
  when others then return jsonb_build_object('ok',false,'error','delete_failed','detail',sqlerrm);
end;
$$;

revoke all on function public.admin_delete_account_ls8(uuid) from public, anon;
grant execute on function public.admin_delete_account_ls8(uuid) to authenticated;

commit;
