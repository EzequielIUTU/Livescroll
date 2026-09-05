-- ============================================================
-- LiveScroll Shared Core · #VIRALES V1
-- Compatible con LS6 y LS7. No modifica tablas ni funciones existentes.
-- Ejecutar completo en el Editor SQL de Supabase.
-- ============================================================

create or replace function public.get_viral_videos_v1(
  p_window_hours integer default 24,
  p_limit integer default 20,
  p_origin text default null
)
returns table(
  video_id uuid,
  title text,
  platform text,
  creator_username text,
  client_origin text,
  created_at timestamptz,
  unique_views bigint,
  likes bigint,
  comments bigint,
  shares bigint,
  viral_score numeric
)
language sql
security definer
set search_path = public
stable
as $$
  with settings as (
    select
      greatest(1, least(coalesce(p_window_hours, 24), 24 * 30))::integer as window_hours,
      greatest(1, least(coalesce(p_limit, 20), 50))::integer as result_limit
  ),
  candidates as (
    select v.id, v.title, v.platform, v.user_id, v.client_origin, v.created_at
    from public.videos v
    cross join settings s
    join public.profiles p on p.id = v.user_id
    where coalesce(p.is_blocked, false) = false
      and v.created_at >= now() - make_interval(hours => greatest(s.window_hours * 4, 168))
      and (p_origin is null or v.client_origin = p_origin)
  ),
  view_signal as (
    select w.video_id, count(distinct w.viewer_id)::bigint as unique_views
    from public.watch_sessions w
    join candidates c on c.id = w.video_id
    cross join settings s
    where w.created_at >= now() - make_interval(hours => s.window_hours)
      and w.viewer_id is distinct from c.user_id
    group by w.video_id
  ),
  like_signal as (
    select l.video_id, count(distinct l.user_id)::bigint as likes
    from public.video_likes l
    join candidates c on c.id = l.video_id
    cross join settings s
    where l.created_at >= now() - make_interval(hours => s.window_hours)
      and l.user_id is distinct from c.user_id
    group by l.video_id
  ),
  comment_signal as (
    select x.video_id, count(distinct x.user_id)::bigint as comments
    from public.video_comments x
    join candidates c on c.id = x.video_id
    cross join settings s
    where x.created_at >= now() - make_interval(hours => s.window_hours)
      and x.user_id is distinct from c.user_id
    group by x.video_id
  ),
  share_signal as (
    select sh.video_id, count(distinct sh.user_id)::bigint as shares
    from public.video_shares sh
    join candidates c on c.id = sh.video_id
    cross join settings s
    where sh.created_at >= now() - make_interval(hours => s.window_hours)
      and sh.user_id is distinct from c.user_id
    group by sh.video_id
  ),
  scored as (
    select
      c.id as video_id,
      c.title,
      c.platform,
      p.username as creator_username,
      c.client_origin,
      c.created_at,
      coalesce(vs.unique_views, 0)::bigint as unique_views,
      coalesce(ls.likes, 0)::bigint as likes,
      coalesce(cs.comments, 0)::bigint as comments,
      coalesce(ss.shares, 0)::bigint as shares,
      round((
        coalesce(vs.unique_views, 0) * 1.00 +
        coalesce(ls.likes, 0)        * 2.25 +
        coalesce(cs.comments, 0)    * 3.50 +
        coalesce(ss.shares, 0)      * 5.00
      ) / power(1 + extract(epoch from (now() - c.created_at)) / 3600 / 24, 0.72), 2) as viral_score
    from candidates c
    join public.profiles p on p.id = c.user_id
    left join view_signal vs on vs.video_id = c.id
    left join like_signal ls on ls.video_id = c.id
    left join comment_signal cs on cs.video_id = c.id
    left join share_signal ss on ss.video_id = c.id
  )
  select
    s.video_id, s.title, s.platform, s.creator_username, s.client_origin,
    s.created_at, s.unique_views, s.likes, s.comments, s.shares, s.viral_score
  from scored s
  cross join settings cfg
  where s.viral_score > 0
  order by s.viral_score desc, s.created_at desc
  limit (select result_limit from settings);
$$;

revoke all on function public.get_viral_videos_v1(integer, integer, text) from public;
grant execute on function public.get_viral_videos_v1(integer, integer, text) to authenticated;

comment on function public.get_viral_videos_v1(integer, integer, text) is
  'Ranking #Virales: señales únicas recientes, sin puntos ni boosts pagos, con caída temporal.';

-- Comprobación opcional. Debe devolver filas o una lista vacía, nunca modificar datos.
select * from public.get_viral_videos_v1(24, 5, null);
