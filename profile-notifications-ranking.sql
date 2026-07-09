-- ============================================================
-- EDITAR PERFIL + NOTIFICACIONES + RANKING SEMANAL
-- Ejecutá esto en el SQL Editor de Supabase
-- ============================================================

-- ============================================================
-- PARTE 1: EDITAR PERFIL
-- ============================================================
alter table profiles add column if not exists bio text;
alter table profiles add column if not exists avatar_emoji text default '🎬';

create or replace function update_username(p_user_id uuid, p_new_username text)
returns json as $$
begin
  if char_length(trim(p_new_username)) < 3 then
    return json_build_object('ok', false, 'error', 'muy_corto');
  end if;
  if exists (select 1 from profiles where username = p_new_username and id != p_user_id) then
    return json_build_object('ok', false, 'error', 'nombre_ocupado');
  end if;

  update profiles set username = trim(p_new_username) where id = p_user_id;
  return json_build_object('ok', true);
end;
$$ language plpgsql security definer;

-- ============================================================
-- PARTE 2: NOTIFICACIONES INTERNAS
-- ============================================================
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  type text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table notifications enable row level security;
create policy "Usuario ve sus propias notificaciones" on notifications for select using (auth.uid() = user_id);
create policy "Usuario marca sus propias notificaciones como leídas" on notifications for update using (auth.uid() = user_id);

create or replace function notify(p_user_id uuid, p_type text, p_message text)
returns void as $$
begin
  insert into notifications (user_id, type, message) values (p_user_id, p_type, p_message);
end;
$$ language plpgsql security definer;

create or replace function mark_notifications_read(p_user_id uuid)
returns void as $$
begin
  update notifications set read = true where user_id = p_user_id and read = false;
end;
$$ language plpgsql security definer;

-- Enganchamos notificaciones a las acciones que ya existen:

-- Comentario nuevo → avisa al dueño del video
create or replace function add_comment(p_video_id uuid, p_user_id uuid, p_content text)
returns json as $$
declare
  v_owner_id uuid;
  v_pts_giver integer;
  v_pts_owner integer;
  v_cap integer;
  v_already_today integer;
  v_first_comment boolean;
  v_comment_id uuid;
  v_blocked boolean;
  v_commenter_name text;
begin
  select is_blocked into v_blocked from profiles where id = p_user_id;
  if coalesce(v_blocked, false) then
    return json_build_object('ok', false, 'error', 'cuenta_bloqueada');
  end if;

  if char_length(trim(p_content)) < 3 then
    return json_build_object('ok', false, 'error', 'comentario_muy_corto');
  end if;

  select user_id into v_owner_id from videos where id = p_video_id;
  select username into v_commenter_name from profiles where id = p_user_id;

  insert into video_comments (video_id, user_id, content) values (p_video_id, p_user_id, trim(p_content))
  returning id into v_comment_id;

  if v_owner_id != p_user_id then
    perform notify(v_owner_id, 'comment', '@' || v_commenter_name || ' comentó tu video');
  end if;

  v_first_comment := not exists (
    select 1 from video_comments where video_id = p_video_id and user_id = p_user_id and id != v_comment_id
  );

  if v_first_comment and v_owner_id != p_user_id then
    select value::integer into v_cap from app_config where key = 'daily_cap_comments_pts';
    select coalesce(sum(amount),0) into v_already_today from points_ledger
      where user_id = p_user_id and reason = 'comment_given' and created_at >= date_trunc('day', now());

    if v_already_today < v_cap then
      select value::integer into v_pts_giver from app_config where key = 'points_comment_giver';
      select value::integer into v_pts_owner from app_config where key = 'points_comment_owner';

      update profiles set points_balance = points_balance + v_pts_giver where id = p_user_id;
      update profiles set points_balance = points_balance + v_pts_owner where id = v_owner_id;
      insert into points_ledger (user_id, amount, reason, reference_id) values
        (p_user_id, v_pts_giver, 'comment_given', v_comment_id),
        (v_owner_id, v_pts_owner, 'comment_received', v_comment_id);

      perform try_reward_referral(p_user_id);
    end if;
  end if;

  return json_build_object('ok', true, 'comment_id', v_comment_id);
end;
$$ language plpgsql security definer;

-- Seguir a alguien → avisa a quien te siguió
create or replace function toggle_follow(p_follower_id uuid, p_followed_id uuid)
returns json as $$
declare
  v_following boolean;
  v_follower_name text;
begin
  if p_follower_id = p_followed_id then
    return json_build_object('ok', false, 'error', 'no_self_follow');
  end if;

  select exists(select 1 from follows where follower_id = p_follower_id and followed_id = p_followed_id) into v_following;

  if v_following then
    delete from follows where follower_id = p_follower_id and followed_id = p_followed_id;
    return json_build_object('ok', true, 'following', false);
  else
    insert into follows (follower_id, followed_id) values (p_follower_id, p_followed_id);
    select username into v_follower_name from profiles where id = p_follower_id;
    perform notify(p_followed_id, 'follow', '@' || v_follower_name || ' empezó a seguirte');
    return json_build_object('ok', true, 'following', true);
  end if;
end;
$$ language plpgsql security definer;

-- Canje aprobado/rechazado → avisa al usuario
create or replace function admin_approve_redemption(p_redemption_id uuid)
returns json as $$
declare
  v_is_admin boolean;
  v_user_id uuid;
  v_amount numeric;
begin
  select is_admin into v_is_admin from profiles where id = auth.uid();
  if not coalesce(v_is_admin, false) then
    return json_build_object('ok', false, 'error', 'no_autorizado');
  end if;

  select user_id, amount_ars into v_user_id, v_amount from redemptions where id = p_redemption_id and status = 'pending';

  update redemptions set status = 'paid', reviewed_at = now() where id = p_redemption_id and status = 'pending';
  if v_user_id is not null then
    perform notify(v_user_id, 'redemption_approved', 'Tu canje de $' || v_amount || ' fue pagado ✅');
  end if;

  return json_build_object('ok', true);
end;
$$ language plpgsql security definer;

create or replace function admin_reject_redemption(p_redemption_id uuid)
returns json as $$
declare
  v_is_admin boolean;
  v_user_id uuid;
  v_points integer;
begin
  select is_admin into v_is_admin from profiles where id = auth.uid();
  if not coalesce(v_is_admin, false) then
    return json_build_object('ok', false, 'error', 'no_autorizado');
  end if;

  select user_id, points_used into v_user_id, v_points
  from redemptions where id = p_redemption_id and status = 'pending';

  if v_user_id is null then
    return json_build_object('ok', false, 'error', 'no_encontrado');
  end if;

  update redemptions set status = 'rejected', reviewed_at = now() where id = p_redemption_id;
  update profiles set points_balance = points_balance + v_points where id = v_user_id;

  insert into points_ledger (user_id, amount, reason, reference_id)
  values (v_user_id, v_points, 'adjustment', p_redemption_id);

  perform notify(v_user_id, 'redemption_rejected', 'Tu canje fue rechazado, te devolvimos los puntos');

  return json_build_object('ok', true);
end;
$$ language plpgsql security definer;

-- Pago de plan aprobado/rechazado → avisa al usuario
create or replace function admin_approve_subscription(p_request_id uuid)
returns json as $$
declare
  v_is_admin boolean;
  v_user_id uuid;
  v_plan_id text;
  v_bonus integer;
  v_plan_name text;
begin
  select is_admin into v_is_admin from profiles where id = auth.uid();
  if not coalesce(v_is_admin, false) then
    return json_build_object('ok', false, 'error', 'no_autorizado');
  end if;

  select user_id, plan_id into v_user_id, v_plan_id
  from subscription_requests where id = p_request_id and status = 'pending';

  if v_user_id is null then
    return json_build_object('ok', false, 'error', 'no_encontrado');
  end if;

  select signup_bonus_pts, name into v_bonus, v_plan_name from plans where id = v_plan_id;

  update subscription_requests set status = 'approved', reviewed_at = now() where id = p_request_id;
  update profiles set plan_id = v_plan_id, points_balance = points_balance + coalesce(v_bonus, 0) where id = v_user_id;

  if v_bonus > 0 then
    insert into points_ledger (user_id, amount, reason, reference_id) values (v_user_id, v_bonus, 'plan_bonus', p_request_id);
  end if;

  perform notify(v_user_id, 'plan_approved', '¡Tu plan ' || v_plan_name || ' ya está activo! 🎉');

  return json_build_object('ok', true, 'bonus', v_bonus);
end;
$$ language plpgsql security definer;

create or replace function admin_reject_subscription(p_request_id uuid)
returns json as $$
declare
  v_is_admin boolean;
  v_user_id uuid;
begin
  select is_admin into v_is_admin from profiles where id = auth.uid();
  if not coalesce(v_is_admin, false) then
    return json_build_object('ok', false, 'error', 'no_autorizado');
  end if;

  select user_id into v_user_id from subscription_requests where id = p_request_id and status = 'pending';

  update subscription_requests set status = 'rejected', reviewed_at = now()
  where id = p_request_id and status = 'pending';

  if v_user_id is not null then
    perform notify(v_user_id, 'plan_rejected', 'No pudimos confirmar tu pago de plan. Revisá el código y contactanos.');
  end if;

  return json_build_object('ok', true);
end;
$$ language plpgsql security definer;

-- ============================================================
-- PARTE 3: RANKING SEMANAL
-- ============================================================
create or replace function get_weekly_leaderboard()
returns table(username text, avatar_emoji text, total_points bigint) as $$
begin
  return query
  select p.username, p.avatar_emoji, sum(pl.amount)::bigint as total_points
  from points_ledger pl
  join profiles p on p.id = pl.user_id
  where pl.amount > 0 and pl.created_at >= now() - interval '7 days'
  group by p.username, p.avatar_emoji
  order by total_points desc
  limit 20;
end;
$$ language plpgsql security definer;
