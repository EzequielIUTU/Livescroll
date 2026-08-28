-- LiveScroll · Retos diarios automáticos V1
-- Ejecutar una sola vez en Supabase SQL Editor.

create table if not exists public.daily_challenge_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  challenge_date date not null default ((now() at time zone 'America/Argentina/Buenos_Aires')::date),
  event_type text not null check (event_type in ('upload_video','like_video','profile_view')),
  target_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, challenge_date, event_type, target_id)
);

create index if not exists daily_challenge_events_user_day_idx
  on public.daily_challenge_events(user_id, challenge_date);

alter table public.daily_challenge_events enable row level security;

drop policy if exists "Usuario ve su progreso diario" on public.daily_challenge_events;
create policy "Usuario ve su progreso diario"
  on public.daily_challenge_events for select
  using (auth.uid() = user_id);

create or replace function public.record_daily_challenge_event(
  p_event_type text,
  p_target_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_today date := ((now() at time zone 'America/Argentina/Buenos_Aires')::date);
  v_valid boolean := false;
begin
  if v_user is null then
    return jsonb_build_object('ok',false,'error','not_authenticated');
  end if;

  if p_event_type = 'upload_video' then
    select exists(
      select 1 from public.videos
      where id = p_target_id and user_id = v_user
        and created_at >= (v_today::timestamp at time zone 'America/Argentina/Buenos_Aires')
    ) into v_valid;
  elsif p_event_type = 'like_video' then
    select exists(
      select 1 from public.video_likes
      where video_id = p_target_id and user_id = v_user
    ) into v_valid;
  elsif p_event_type = 'profile_view' then
    select exists(
      select 1 from public.profiles
      where id = p_target_id and id <> v_user and ban_reason is null
    ) into v_valid;
  else
    return jsonb_build_object('ok',false,'error','invalid_event');
  end if;

  if not v_valid then
    return jsonb_build_object('ok',false,'error','event_not_verified');
  end if;

  insert into public.daily_challenge_events(user_id,challenge_date,event_type,target_id)
  values(v_user,v_today,p_event_type,p_target_id)
  on conflict(user_id,challenge_date,event_type,target_id) do nothing;

  return jsonb_build_object('ok',true);
end;
$$;

create or replace function public.get_daily_challenges()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_today date := ((now() at time zone 'America/Argentina/Buenos_Aires')::date);
  v_seed integer;
  v_upload integer;
  v_likes integer;
  v_profiles integer;
  v_all jsonb;
  v_rotated jsonb;
begin
  if v_user is null then
    return jsonb_build_object('ok',false,'error','not_authenticated');
  end if;

  select count(distinct target_id) filter (where event_type='upload_video'),
         count(distinct target_id) filter (where event_type='like_video'),
         count(distinct target_id) filter (where event_type='profile_view')
    into v_upload,v_likes,v_profiles
  from public.daily_challenge_events
  where user_id=v_user and challenge_date=v_today;

  v_all := jsonb_build_array(
    jsonb_build_object('type','upload_video','emoji','🎬','title','Subí un video','target',1,'progress',least(coalesce(v_upload,0),1)),
    jsonb_build_object('type','like_video','emoji','❤️','title','Dale Me gusta a 3 videos','target',3,'progress',least(coalesce(v_likes,0),3)),
    jsonb_build_object('type','profile_view','emoji','👤','title','Visitá 2 perfiles nuevos','target',2,'progress',least(coalesce(v_profiles,0),2))
  );

  v_seed := mod(abs(hashtext(v_user::text || v_today::text)::bigint),3)::integer;
  v_rotated := case v_seed
    when 1 then jsonb_build_array(v_all->1,v_all->2,v_all->0)
    when 2 then jsonb_build_array(v_all->2,v_all->0,v_all->1)
    else v_all
  end;

  return jsonb_build_object(
    'ok',true,
    'date',v_today,
    'challenges',v_rotated,
    'completed',(
      select count(*) from jsonb_array_elements(v_rotated) item
      where (item->>'progress')::int >= (item->>'target')::int
    )
  );
end;
$$;

revoke all on function public.record_daily_challenge_event(text,uuid) from public;
revoke all on function public.get_daily_challenges() from public;
grant execute on function public.record_daily_challenge_event(text,uuid) to authenticated;
grant execute on function public.get_daily_challenges() to authenticated;
