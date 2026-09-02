-- LiveScroll · Control central de versiones LS6 / LS7 / LS8

begin;

create table if not exists public.app_version_control (
  generation smallint primary key check (generation in (6,7,8)),
  status text not null default 'locked' check (status in ('open','locked','maintenance')),
  launch_at timestamptz,
  release_label text,
  message text,
  demo_available boolean not null default false,
  auto_release boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.app_version_control enable row level security;
revoke all on public.app_version_control from anon, authenticated;

insert into public.app_version_control(generation,status,launch_at,release_label,message,demo_available,auto_release)
values
  (6,'open',null,'DISPONIBLE','La generación clásica de LiveScroll.',false,false),
  (7,'locked','2026-10-25 00:00:00 America/Argentina/Buenos_Aires','25/10/2026','La nueva generación está en camino.',false,true),
  (8,'locked',null,'2027','LiveScroll 8 está tomando forma.',true,false)
on conflict(generation) do nothing;

create or replace function public.get_version_control()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object('ok',true,'versions',coalesce(jsonb_agg(jsonb_build_object(
    'generation',generation,
    'status',case when auto_release and launch_at is not null and launch_at<=now() then 'open' else status end,
    'configured_status',status,
    'launch_at',launch_at,
    'release_label',release_label,
    'message',message,
    'demo_available',demo_available,
    'auto_release',auto_release
  ) order by generation),'[]'::jsonb))
  from public.app_version_control;
$$;

create or replace function public.admin_set_version_control(
  p_generation smallint,
  p_status text,
  p_launch_at timestamptz default null,
  p_release_label text default null,
  p_message text default null,
  p_demo_available boolean default false,
  p_auto_release boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ls8_require_admin();
  if p_generation not in (6,7,8) then return jsonb_build_object('ok',false,'error','invalid_generation'); end if;
  if p_status not in ('open','locked','maintenance') then return jsonb_build_object('ok',false,'error','invalid_status'); end if;
  if length(coalesce(p_message,''))>300 then return jsonb_build_object('ok',false,'error','message_too_long'); end if;

  insert into public.app_version_control(generation,status,launch_at,release_label,message,demo_available,auto_release,updated_by)
  values(p_generation,p_status,p_launch_at,nullif(btrim(coalesce(p_release_label,'')),''),nullif(btrim(coalesce(p_message,'')),''),p_demo_available,p_auto_release,auth.uid())
  on conflict(generation) do update set status=excluded.status,launch_at=excluded.launch_at,release_label=excluded.release_label,message=excluded.message,demo_available=excluded.demo_available,auto_release=excluded.auto_release,updated_at=now(),updated_by=auth.uid();

  return jsonb_build_object('ok',true,'generation',p_generation,'status',p_status);
end;
$$;

grant execute on function public.get_version_control() to anon, authenticated;
grant execute on function public.admin_set_version_control(smallint,text,timestamptz,text,text,boolean,boolean) to authenticated;

commit;
