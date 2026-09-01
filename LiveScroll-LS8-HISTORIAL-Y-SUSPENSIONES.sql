-- LiveScroll 8 · Suspensiones temporales e historial administrativo

begin;

alter table public.user_admin_controls
  add column if not exists suspended_until timestamptz,
  add column if not exists suspension_reason text;

create table if not exists public.admin_action_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  admin_id uuid references auth.users(id) on delete set null,
  action_type text not null,
  detail text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_action_history_user_created_idx
  on public.admin_action_history(user_id,created_at desc);

alter table public.admin_action_history enable row level security;
revoke all on public.admin_action_history from anon, authenticated;

create or replace function public.admin_set_ls8_suspension(
  p_user_id uuid,
  p_reason text,
  p_until timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_reason text := btrim(coalesce(p_reason,''));
begin
  perform public.ls8_require_admin();
  if length(v_reason) < 3 or length(v_reason) > 240 then
    return jsonb_build_object('ok',false,'error','invalid_reason');
  end if;
  if p_until is not null and p_until <= now() then
    return jsonb_build_object('ok',false,'error','invalid_expiration');
  end if;

  insert into public.user_admin_controls(user_id,suspended_until,suspension_reason,updated_by)
  values(p_user_id,p_until,v_reason,auth.uid())
  on conflict(user_id) do update set
    suspended_until=p_until,
    suspension_reason=v_reason,
    updated_at=now(),
    updated_by=auth.uid();

  insert into public.admin_action_history(user_id,admin_id,action_type,detail,metadata)
  values(p_user_id,auth.uid(),case when p_until is null then 'suspension_permanent' else 'suspension_temporary' end,v_reason,jsonb_build_object('until',p_until));

  return jsonb_build_object('ok',true,'until',p_until);
end;
$$;

create or replace function public.admin_clear_ls8_suspension(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ls8_require_admin();
  insert into public.user_admin_controls(user_id,suspended_until,suspension_reason,updated_by)
  values(p_user_id,null,null,auth.uid())
  on conflict(user_id) do update set suspended_until=null,suspension_reason=null,updated_at=now(),updated_by=auth.uid();
  insert into public.admin_action_history(user_id,admin_id,action_type,detail)
  values(p_user_id,auth.uid(),'suspension_cleared','Acceso restaurado');
  return jsonb_build_object('ok',true);
end;
$$;

create or replace function public.admin_get_user_history(p_user_id uuid,p_limit integer default 30)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ls8_require_admin();
  return jsonb_build_object('ok',true,'history',coalesce((
    select jsonb_agg(to_jsonb(h) order by h.created_at desc)
    from (
      select id,action_type,detail,metadata,created_at
      from public.admin_action_history
      where user_id=p_user_id
      order by created_at desc
      limit greatest(1,least(coalesce(p_limit,30),100))
    ) h
  ),'[]'::jsonb));
end;
$$;

create or replace function public.admin_get_user_controls(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_row public.user_admin_controls%rowtype;
begin
  perform public.ls8_require_admin();
  select * into v_row from public.user_admin_controls where user_id=p_user_id;
  if v_row.suspended_until is not null and v_row.suspended_until <= now() then
    update public.user_admin_controls set suspended_until=null,suspension_reason=null,updated_at=now() where user_id=p_user_id;
    insert into public.admin_action_history(user_id,admin_id,action_type,detail)
    values(p_user_id,auth.uid(),'suspension_expired','Suspensión finalizada automáticamente');
    v_row.suspended_until:=null;v_row.suspension_reason:=null;
  end if;
  return jsonb_build_object('ok',true,'plans_blocked',coalesce(v_row.plans_blocked,false),'wallet_blocked',coalesce(v_row.wallet_blocked,false),'admin_notes',coalesce(v_row.admin_notes,''),'suspended_until',v_row.suspended_until,'suspension_reason',v_row.suspension_reason,'updated_at',v_row.updated_at);
end;
$$;

create or replace function public.get_my_service_access()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_row public.user_admin_controls%rowtype;
begin
  select * into v_row from public.user_admin_controls where user_id=auth.uid();
  if v_row.suspended_until is not null and v_row.suspended_until <= now() then
    update public.user_admin_controls set suspended_until=null,suspension_reason=null,updated_at=now() where user_id=auth.uid();
    insert into public.admin_action_history(user_id,action_type,detail)
    values(auth.uid(),'suspension_expired','Suspensión finalizada automáticamente');
    v_row.suspended_until:=null;v_row.suspension_reason:=null;
  end if;
  return jsonb_build_object('plans_blocked',coalesce(v_row.plans_blocked,false),'wallet_blocked',coalesce(v_row.wallet_blocked,false),'suspended',v_row.suspension_reason is not null,'suspended_until',v_row.suspended_until,'suspension_reason',v_row.suspension_reason);
end;
$$;

grant execute on function public.admin_set_ls8_suspension(uuid,text,timestamptz) to authenticated;
grant execute on function public.admin_clear_ls8_suspension(uuid) to authenticated;
grant execute on function public.admin_get_user_history(uuid,integer) to authenticated;

commit;
