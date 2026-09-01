-- LiveScroll 8 · Controles administrativos individuales
-- Agrega bloqueo de Planes/Billetera y una nota privada por usuario.

begin;

create table if not exists public.user_admin_controls (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  plans_blocked boolean not null default false,
  wallet_blocked boolean not null default false,
  admin_notes text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.user_admin_controls enable row level security;
revoke all on public.user_admin_controls from anon, authenticated;

create or replace function public.ls8_require_admin()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin is true
  ) then
    raise exception 'admin_required';
  end if;
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
  select * into v_row from public.user_admin_controls where user_id = p_user_id;
  return jsonb_build_object(
    'ok', true,
    'plans_blocked', coalesce(v_row.plans_blocked, false),
    'wallet_blocked', coalesce(v_row.wallet_blocked, false),
    'admin_notes', coalesce(v_row.admin_notes, ''),
    'updated_at', v_row.updated_at
  );
end;
$$;

create or replace function public.admin_set_user_service_access(
  p_user_id uuid,
  p_service text,
  p_blocked boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ls8_require_admin();
  if p_service not in ('plans','wallet') then
    return jsonb_build_object('ok',false,'error','invalid_service');
  end if;

  insert into public.user_admin_controls(user_id,plans_blocked,wallet_blocked,updated_by)
  values (
    p_user_id,
    case when p_service='plans' then p_blocked else false end,
    case when p_service='wallet' then p_blocked else false end,
    auth.uid()
  )
  on conflict (user_id) do update set
    plans_blocked = case when p_service='plans' then p_blocked else user_admin_controls.plans_blocked end,
    wallet_blocked = case when p_service='wallet' then p_blocked else user_admin_controls.wallet_blocked end,
    updated_at = now(),
    updated_by = auth.uid();

  return jsonb_build_object('ok',true,'service',p_service,'blocked',p_blocked);
end;
$$;

create or replace function public.admin_save_user_note(p_user_id uuid,p_note text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_note text := nullif(btrim(coalesce(p_note,'')),'');
begin
  perform public.ls8_require_admin();
  if length(coalesce(v_note,'')) > 1200 then
    return jsonb_build_object('ok',false,'error','note_too_long');
  end if;

  insert into public.user_admin_controls(user_id,admin_notes,updated_by)
  values (p_user_id,v_note,auth.uid())
  on conflict (user_id) do update set
    admin_notes = v_note,
    updated_at = now(),
    updated_by = auth.uid();

  return jsonb_build_object('ok',true);
end;
$$;

create or replace function public.get_my_service_access()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'plans_blocked', coalesce(c.plans_blocked,false),
    'wallet_blocked', coalesce(c.wallet_blocked,false)
  )
  from (select auth.uid() as user_id) me
  left join public.user_admin_controls c on c.user_id = me.user_id;
$$;

revoke all on function public.ls8_require_admin() from public, anon, authenticated;
grant execute on function public.admin_get_user_controls(uuid) to authenticated;
grant execute on function public.admin_set_user_service_access(uuid,text,boolean) to authenticated;
grant execute on function public.admin_save_user_note(uuid,text) to authenticated;
grant execute on function public.get_my_service_access() to authenticated;

commit;
