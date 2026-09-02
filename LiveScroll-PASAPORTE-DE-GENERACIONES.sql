-- ============================================================
-- LIVESCROLL · SHARED CORE · PASAPORTE DE GENERACIONES
-- Base aislada para LS6 / LS7 / LS8
-- Ejecutar una sola vez en Supabase SQL Editor.
-- ============================================================

begin;

create table if not exists public.user_generation_passports (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  active_generation smallint not null default 6 check (active_generation in (6,7,8)),
  first_generation smallint not null default 6 check (first_generation in (6,7,8)),
  total_switches bigint not null default 0 check (total_switches >= 0),
  selected_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_generation_usage (
  user_id uuid not null references public.profiles(id) on delete cascade,
  generation smallint not null check (generation in (6,7,8)),
  launch_count bigint not null default 1 check (launch_count >= 0),
  first_used_at timestamptz not null default now(),
  last_used_at timestamptz not null default now(),
  primary key (user_id, generation)
);

create index if not exists user_generation_passports_active_idx
  on public.user_generation_passports(active_generation);

create index if not exists user_generation_usage_generation_idx
  on public.user_generation_usage(generation, last_used_at desc);

alter table public.user_generation_passports enable row level security;
alter table public.user_generation_usage enable row level security;

drop policy if exists generation_passport_read_authenticated on public.user_generation_passports;
create policy generation_passport_read_authenticated
  on public.user_generation_passports
  for select
  to authenticated
  using (true);

drop policy if exists generation_usage_read_own on public.user_generation_usage;
create policy generation_usage_read_own
  on public.user_generation_usage
  for select
  to authenticated
  using (user_id = auth.uid());

-- Las escrituras directas quedan cerradas. Toda actualización pasa por RPC.
revoke insert, update, delete on public.user_generation_passports from anon, authenticated;
revoke insert, update, delete on public.user_generation_usage from anon, authenticated;
grant select on public.user_generation_passports to authenticated;
grant select on public.user_generation_usage to authenticated;

create or replace function public.set_my_generation(p_generation integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_previous smallint;
  v_passport public.user_generation_passports%rowtype;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  if p_generation not in (6,7,8) then
    return jsonb_build_object('ok', false, 'error', 'invalid_generation');
  end if;

  -- Evita crear pasaportes para cuentas que ya no existen.
  if not exists (select 1 from public.profiles where id = v_user_id) then
    return jsonb_build_object('ok', false, 'error', 'profile_not_found');
  end if;

  select active_generation
    into v_previous
    from public.user_generation_passports
   where user_id = v_user_id
   for update;

  insert into public.user_generation_passports (
    user_id, active_generation, first_generation, total_switches,
    selected_at, created_at, updated_at
  ) values (
    v_user_id, p_generation::smallint, p_generation::smallint, 0,
    now(), now(), now()
  )
  on conflict (user_id) do update set
    active_generation = excluded.active_generation,
    total_switches = public.user_generation_passports.total_switches
      + case when public.user_generation_passports.active_generation is distinct from excluded.active_generation then 1 else 0 end,
    selected_at = excluded.selected_at,
    updated_at = excluded.updated_at;

  insert into public.user_generation_usage (
    user_id, generation, launch_count, first_used_at, last_used_at
  ) values (
    v_user_id, p_generation::smallint, 1, now(), now()
  )
  on conflict (user_id, generation) do update set
    launch_count = public.user_generation_usage.launch_count + 1,
    last_used_at = excluded.last_used_at;

  select * into v_passport
    from public.user_generation_passports
   where user_id = v_user_id;

  return jsonb_build_object(
    'ok', true,
    'active_generation', v_passport.active_generation,
    'first_generation', v_passport.first_generation,
    'switched', v_previous is not null and v_previous is distinct from v_passport.active_generation,
    'total_switches', v_passport.total_switches,
    'selected_at', v_passport.selected_at
  );
end;
$$;

create or replace function public.get_generation_passport(p_user_id uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_requester uuid := auth.uid();
  v_target uuid := coalesce(p_user_id, auth.uid());
  v_passport public.user_generation_passports%rowtype;
  v_usage jsonb := '[]'::jsonb;
begin
  if v_requester is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  select * into v_passport
    from public.user_generation_passports
   where user_id = v_target;

  if not found then
    return jsonb_build_object(
      'ok', true,
      'exists', false,
      'user_id', v_target,
      'active_generation', 6,
      'first_generation', 6,
      'total_switches', 0,
      'generations', '[]'::jsonb
    );
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'generation', generation,
    'launch_count', launch_count,
    'first_used_at', first_used_at,
    'last_used_at', last_used_at
  ) order by generation), '[]'::jsonb)
    into v_usage
    from public.user_generation_usage
   where user_id = v_target;

  return jsonb_build_object(
    'ok', true,
    'exists', true,
    'user_id', v_passport.user_id,
    'active_generation', v_passport.active_generation,
    'first_generation', v_passport.first_generation,
    'total_switches', v_passport.total_switches,
    'selected_at', v_passport.selected_at,
    'generations', v_usage
  );
end;
$$;

create or replace function public.admin_get_generation_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_is_admin boolean := false;
  v_by_active jsonb;
  v_by_usage jsonb;
begin
  select coalesce(is_admin, false)
    into v_is_admin
    from public.profiles
   where id = v_user_id;

  if not v_is_admin then
    return jsonb_build_object('ok', false, 'error', 'admin_required');
  end if;

  select coalesce(jsonb_agg(row_data order by generation), '[]'::jsonb)
    into v_by_active
    from (
      select g.generation, count(p.user_id)::bigint as users
      from generate_series(6,8) as g(generation)
      left join public.user_generation_passports p
        on p.active_generation = g.generation
      group by g.generation
    ) row_data;

  select coalesce(jsonb_agg(row_data order by generation), '[]'::jsonb)
    into v_by_usage
    from (
      select g.generation,
             count(distinct u.user_id)::bigint as users,
             coalesce(sum(u.launch_count),0)::bigint as launches
      from generate_series(6,8) as g(generation)
      left join public.user_generation_usage u
        on u.generation = g.generation
      group by g.generation
    ) row_data;

  return jsonb_build_object(
    'ok', true,
    'passports', (select count(*)::bigint from public.user_generation_passports),
    'multi_generation_users', (
      select count(*)::bigint
      from (
        select user_id
        from public.user_generation_usage
        group by user_id
        having count(*) > 1
      ) multi
    ),
    'active_by_generation', v_by_active,
    'usage_by_generation', v_by_usage
  );
end;
$$;

revoke all on function public.set_my_generation(integer) from public;
revoke all on function public.get_generation_passport(uuid) from public;
revoke all on function public.admin_get_generation_stats() from public;

grant execute on function public.set_my_generation(integer) to authenticated;
grant execute on function public.get_generation_passport(uuid) to authenticated;
grant execute on function public.admin_get_generation_stats() to authenticated;

commit;

-- Verificación rápida:
-- select public.set_my_generation(6);
-- select public.get_generation_passport();
-- select public.admin_get_generation_stats(); -- únicamente Admin
