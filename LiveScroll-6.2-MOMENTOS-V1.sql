-- LiveScroll 6.2 · Momentos V1
-- Ejecutar una sola vez en Supabase SQL Editor.

create table if not exists public.moments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text,
  media_url text,
  media_type text check (media_type in ('image','video')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  constraint moments_has_content check (
    nullif(trim(coalesce(content,'')),'') is not null or media_url is not null
  )
);

create table if not exists public.moment_views (
  moment_id uuid not null references public.moments(id) on delete cascade,
  viewer_id uuid not null references public.profiles(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key(moment_id,viewer_id)
);

create table if not exists public.moment_reactions (
  moment_id uuid not null references public.moments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  emoji text not null check (emoji in ('❤️','🔥','👏','😂','✨')),
  created_at timestamptz not null default now(),
  primary key(moment_id,user_id)
);

create index if not exists moments_active_idx on public.moments(expires_at desc,created_at desc);
create index if not exists moments_user_idx on public.moments(user_id,created_at desc);

alter table public.moments enable row level security;
alter table public.moment_views enable row level security;
alter table public.moment_reactions enable row level security;

drop policy if exists "Ver momentos activos" on public.moments;
create policy "Ver momentos activos" on public.moments for select
  using (expires_at > now());

drop policy if exists "Eliminar momentos propios" on public.moments;
create policy "Eliminar momentos propios" on public.moments for delete
  using (auth.uid() = user_id);

drop policy if exists "Ver vistas propias" on public.moment_views;
create policy "Ver vistas propias" on public.moment_views for select
  using (
    viewer_id = auth.uid() or exists(
      select 1 from public.moments m where m.id=moment_id and m.user_id=auth.uid()
    )
  );

drop policy if exists "Ver reacciones de momentos" on public.moment_reactions;
create policy "Ver reacciones de momentos" on public.moment_reactions for select
  using (auth.uid() is not null);

create or replace function public.create_moment(
  p_content text default null,
  p_media_url text default null,
  p_media_type text default null
) returns jsonb
language plpgsql security definer set search_path=public
as $$
declare v_user uuid:=auth.uid(); v_id uuid;
begin
  if v_user is null then return jsonb_build_object('ok',false,'error','not_authenticated'); end if;
  if coalesce((select is_blocked from public.profiles where id=v_user),false) then
    return jsonb_build_object('ok',false,'error','account_blocked');
  end if;
  if length(trim(coalesce(p_content,''))) > 280 then
    return jsonb_build_object('ok',false,'error','content_too_long');
  end if;
  if p_media_url is not null and p_media_url !~ '^https://'
     then return jsonb_build_object('ok',false,'error','invalid_media_url'); end if;
  if p_media_url is not null and p_media_type not in ('image','video')
     then return jsonb_build_object('ok',false,'error','invalid_media_type'); end if;
  if nullif(trim(coalesce(p_content,'')),'') is null and p_media_url is null
     then return jsonb_build_object('ok',false,'error','empty_moment'); end if;

  insert into public.moments(user_id,content,media_url,media_type)
  values(v_user,nullif(trim(coalesce(p_content,'')),''),p_media_url,p_media_type)
  returning id into v_id;
  return jsonb_build_object('ok',true,'id',v_id);
end; $$;

create or replace function public.get_active_moments()
returns jsonb
language sql security definer set search_path=public
as $$
  select coalesce(jsonb_agg(row_data order by (row_data->>'created_at')::timestamptz desc),'[]'::jsonb)
  from (
    select jsonb_build_object(
      'id',m.id,'user_id',m.user_id,'content',m.content,'media_url',m.media_url,
      'media_type',m.media_type,'created_at',m.created_at,'expires_at',m.expires_at,
      'username',p.username,'avatar_url',p.avatar_url,'avatar_emoji',p.avatar_emoji,
      'view_count',(select count(*) from public.moment_views v where v.moment_id=m.id),
      'reaction_count',(select count(*) from public.moment_reactions r where r.moment_id=m.id),
      'my_reaction',(select r.emoji from public.moment_reactions r where r.moment_id=m.id and r.user_id=auth.uid())
    ) row_data
    from public.moments m join public.profiles p on p.id=m.user_id
    where m.expires_at > now() and p.ban_reason is null
    order by m.created_at desc limit 60
  ) q;
$$;

create or replace function public.record_moment_view(p_moment_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then return jsonb_build_object('ok',false); end if;
  if not exists(select 1 from public.moments where id=p_moment_id and expires_at>now())
    then return jsonb_build_object('ok',false,'error','not_available'); end if;
  insert into public.moment_views(moment_id,viewer_id) values(p_moment_id,auth.uid())
  on conflict do nothing;
  return jsonb_build_object('ok',true);
end; $$;

create or replace function public.react_to_moment(p_moment_id uuid,p_emoji text)
returns jsonb language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then return jsonb_build_object('ok',false); end if;
  if p_emoji not in ('❤️','🔥','👏','😂','✨') then
    return jsonb_build_object('ok',false,'error','invalid_reaction'); end if;
  if not exists(select 1 from public.moments where id=p_moment_id and expires_at>now())
    then return jsonb_build_object('ok',false,'error','not_available'); end if;
  insert into public.moment_reactions(moment_id,user_id,emoji)
  values(p_moment_id,auth.uid(),p_emoji)
  on conflict(moment_id,user_id) do update set emoji=excluded.emoji,created_at=now();
  return jsonb_build_object('ok',true);
end; $$;

revoke all on function public.create_moment(text,text,text) from public;
revoke all on function public.get_active_moments() from public;
revoke all on function public.record_moment_view(uuid) from public;
revoke all on function public.react_to_moment(uuid,text) from public;
grant execute on function public.create_moment(text,text,text) to authenticated;
grant execute on function public.get_active_moments() to authenticated;
grant execute on function public.record_moment_view(uuid) to authenticated;
grant execute on function public.react_to_moment(uuid,text) to authenticated;
