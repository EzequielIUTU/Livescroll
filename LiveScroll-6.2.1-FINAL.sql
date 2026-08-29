-- ============================================================
-- LiveScroll 6.2.1 · PULSO DIARIO
-- INSTALACIÓN FINAL + NOVEDADES
--
-- Ejecutar UNA SOLA VEZ en Supabase > SQL Editor.
-- Ejecutarlo únicamente cuando se decida publicar la versión.
-- El cartel se activa automáticamente; no requiere usar el botón del Admin.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- RETOS DIARIOS AUTOMÁTICOS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.daily_challenge_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_date date NOT NULL DEFAULT ((now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date),
  event_type text NOT NULL CHECK (event_type IN ('upload_video','like_video','profile_view')),
  target_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, challenge_date, event_type, target_id)
);

CREATE INDEX IF NOT EXISTS daily_challenge_events_user_day_idx
  ON public.daily_challenge_events(user_id, challenge_date);

ALTER TABLE public.daily_challenge_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuario ve su progreso diario" ON public.daily_challenge_events;
CREATE POLICY "Usuario ve su progreso diario"
  ON public.daily_challenge_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.record_daily_challenge_event(
  p_event_type text,
  p_target_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_today date := ((now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date);
  v_valid boolean := false;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok',false,'error','not_authenticated');
  END IF;

  IF p_event_type = 'upload_video' THEN
    SELECT EXISTS(
      SELECT 1 FROM public.videos
      WHERE id = p_target_id AND user_id = v_user
        AND created_at >= (v_today::timestamp AT TIME ZONE 'America/Argentina/Buenos_Aires')
    ) INTO v_valid;
  ELSIF p_event_type = 'like_video' THEN
    SELECT EXISTS(
      SELECT 1 FROM public.video_likes
      WHERE video_id = p_target_id AND user_id = v_user
    ) INTO v_valid;
  ELSIF p_event_type = 'profile_view' THEN
    SELECT EXISTS(
      SELECT 1 FROM public.profiles
      WHERE id = p_target_id AND id <> v_user AND ban_reason IS NULL
    ) INTO v_valid;
  ELSE
    RETURN jsonb_build_object('ok',false,'error','invalid_event');
  END IF;

  IF NOT v_valid THEN
    RETURN jsonb_build_object('ok',false,'error','event_not_verified');
  END IF;

  INSERT INTO public.daily_challenge_events(user_id,challenge_date,event_type,target_id)
  VALUES(v_user,v_today,p_event_type,p_target_id)
  ON CONFLICT(user_id,challenge_date,event_type,target_id) DO NOTHING;

  RETURN jsonb_build_object('ok',true);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_daily_challenges()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_today date := ((now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date);
  v_seed integer;
  v_upload integer;
  v_likes integer;
  v_profiles integer;
  v_all jsonb;
  v_rotated jsonb;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok',false,'error','not_authenticated');
  END IF;

  SELECT count(DISTINCT target_id) FILTER (WHERE event_type='upload_video'),
         count(DISTINCT target_id) FILTER (WHERE event_type='like_video'),
         count(DISTINCT target_id) FILTER (WHERE event_type='profile_view')
    INTO v_upload,v_likes,v_profiles
  FROM public.daily_challenge_events
  WHERE user_id=v_user AND challenge_date=v_today;

  v_all := jsonb_build_array(
    jsonb_build_object('type','upload_video','emoji','🎬','title','Subí un video','target',1,'progress',least(coalesce(v_upload,0),1)),
    jsonb_build_object('type','like_video','emoji','❤️','title','Dale Me gusta a 3 videos','target',3,'progress',least(coalesce(v_likes,0),3)),
    jsonb_build_object('type','profile_view','emoji','👤','title','Visitá 2 perfiles nuevos','target',2,'progress',least(coalesce(v_profiles,0),2))
  );

  v_seed := mod(abs(hashtext(v_user::text || v_today::text)::bigint),3)::integer;
  v_rotated := CASE v_seed
    WHEN 1 THEN jsonb_build_array(v_all->1,v_all->2,v_all->0)
    WHEN 2 THEN jsonb_build_array(v_all->2,v_all->0,v_all->1)
    ELSE v_all
  END;

  RETURN jsonb_build_object(
    'ok',true,
    'date',v_today,
    'challenges',v_rotated,
    'completed',(
      SELECT count(*) FROM jsonb_array_elements(v_rotated) item
      WHERE (item->>'progress')::int >= (item->>'target')::int
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.record_daily_challenge_event(text,uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_daily_challenges() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_daily_challenge_event(text,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_daily_challenges() TO authenticated;

-- ------------------------------------------------------------
-- NOVEDADES 6.2.1
-- El código agrupa cada categoría en una única sección visible.
-- ------------------------------------------------------------

DO $changelog$
DECLARE
  v_version integer;
BEGIN
  -- 6.2.0 fue un archivo provisional. Si llegó a ejecutarse, 6.2.1 lo
  -- reemplaza para evitar dos versiones con las mismas mejoras.
  DELETE FROM public.changelog_entries
  WHERE display_version IN ('6.2.0','6.2.1');

  SELECT COALESCE(MAX(version), 0) + 1
  INTO v_version
  FROM public.changelog_entries;

  INSERT INTO public.changelog_entries
    (version, display_version, category, content)
  VALUES
    -- NUEVO
    (v_version, '6.2.1', 'nuevo',
      'Llegan los Retos diarios: cada día LiveScroll propone una misión nueva y registra el progreso automáticamente.'),
    (v_version, '6.2.1', 'nuevo',
      'LiveScroll Pulse reúne el avance diario en un cartel compacto que no reduce el espacio del Feed.'),

    -- MEJORA
    (v_version, '6.2.1', 'actualizado',
      'Nova administra mejor la memoria y prepara únicamente el próximo video para mantener una navegación fluida.'),
    (v_version, '6.2.1', 'actualizado',
      'Legacy utiliza miniaturas más livianas y conserva solamente el reproductor visible en dispositivos antiguos.'),
    (v_version, '6.2.1', 'actualizado',
      'Las cuentas conectadas de Kick y Twitch aparecen automáticamente en el perfil; el enlace manual queda como respaldo opcional.'),
    (v_version, '6.2.1', 'actualizado',
      'Los avisos de directos identifican la plataforma, agrupan avisos repetidos y abren el canal oficial de Kick o Twitch.'),

    -- REPARADO
    (v_version, '6.2.1', 'reparado',
      'Se corrigió el caso en que un MP4 podía reproducir sonido antes de mostrar el primer cuadro de imagen.'),
    (v_version, '6.2.1', 'reparado',
      'Los retos diarios ahora se renuevan correctamente al cambiar el día aunque LiveScroll permanezca abierto.'),
    (v_version, '6.2.1', 'reparado',
      'Se retiraron por completo el reproductor y el chat interno antiguo de Twitch para evitar errores de compatibilidad.');

  -- Publica automáticamente la versión recién cargada. get_pending_content
  -- comparará este valor con la versión vista por cada usuario y mostrará
  -- el cartel sin necesidad de pulsar "Subir versión de Novedades".
  INSERT INTO public.content_versions(content_key,current_version)
  VALUES('changelog',v_version)
  ON CONFLICT(content_key) DO UPDATE
    SET current_version = EXCLUDED.current_version;
END $changelog$;

COMMIT;

-- Comprobación final: deben aparecer únicamente Nuevo, Mejora y Reparado.
SELECT version, display_version, category, content
FROM public.changelog_entries
WHERE display_version = '6.2.1'
ORDER BY
  CASE category
    WHEN 'nuevo' THEN 1
    WHEN 'actualizado' THEN 2
    WHEN 'reparado' THEN 3
    ELSE 4
  END,
  content;
