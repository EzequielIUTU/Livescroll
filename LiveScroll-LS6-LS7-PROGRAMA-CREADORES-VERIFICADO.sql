-- LiveScroll 6 + 7 · Programa de Creadores, términos y verificación
-- Ejecutar una sola vez en Supabase SQL Editor.
BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_creator_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS creator_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS creator_verified_by uuid,
  ADD COLUMN IF NOT EXISTS creator_terms_version text,
  ADD COLUMN IF NOT EXISTS creator_terms_accepted_at timestamptz;

CREATE TABLE IF NOT EXISTS public.creator_program_terms (
  version text PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  effective_at timestamptz NOT NULL DEFAULT now(),
  active boolean NOT NULL DEFAULT true
);

INSERT INTO public.creator_program_terms(version,title,content,effective_at,active)
VALUES (
  '1.0',
  'Términos y Condiciones del Programa de Creadores',
  'Contenido propio y permitido; conducta responsable; enlaces reales y autorizados; moderación y posible retiro de acceso; ausencia de ingresos o alcance garantizados; responsabilidad por la seguridad de la cuenta; nueva aceptación ante cambios importantes.',
  now(),
  true
)
ON CONFLICT (version) DO UPDATE SET
  title=EXCLUDED.title,content=EXCLUDED.content,active=true;

ALTER TABLE public.creator_program_terms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS creator_program_terms_read ON public.creator_program_terms;
CREATE POLICY creator_program_terms_read ON public.creator_program_terms
FOR SELECT TO authenticated USING (active=true);

CREATE OR REPLACE FUNCTION public.get_my_creator_program_status()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_row public.profiles%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('ok',false,'error','not_authenticated'); END IF;
  SELECT * INTO v_row FROM public.profiles WHERE id=auth.uid();
  RETURN jsonb_build_object(
    'ok',true,
    'is_creator_verified',coalesce(v_row.is_creator_verified,false),
    'verified_at',v_row.creator_verified_at,
    'terms_version',v_row.creator_terms_version,
    'terms_accepted_at',v_row.creator_terms_accepted_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_creator_program_terms(p_version text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_now timestamptz:=now();
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('ok',false,'error','not_authenticated'); END IF;
  IF NOT EXISTS(SELECT 1 FROM public.creator_program_terms WHERE version=p_version AND active=true) THEN
    RETURN jsonb_build_object('ok',false,'error','invalid_terms_version');
  END IF;
  UPDATE public.profiles SET creator_terms_version=p_version,creator_terms_accepted_at=v_now WHERE id=auth.uid();
  RETURN jsonb_build_object('ok',true,'version',p_version,'accepted_at',v_now);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_creator_access(p_user_id uuid,p_enabled boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND is_admin=true) THEN
    RETURN jsonb_build_object('ok',false,'error','no_autorizado');
  END IF;
  IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=p_user_id) THEN
    RETURN jsonb_build_object('ok',false,'error','usuario_no_encontrado');
  END IF;
  UPDATE public.profiles SET
    is_creator=p_enabled,
    is_creator_verified=CASE WHEN p_enabled THEN is_creator_verified ELSE false END,
    creator_verified_at=CASE WHEN p_enabled THEN creator_verified_at ELSE NULL END,
    creator_verified_by=CASE WHEN p_enabled THEN creator_verified_by ELSE NULL END
  WHERE id=p_user_id;
  RETURN jsonb_build_object('ok',true,'is_creator',p_enabled);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_creator_program_verified(p_user_id uuid,p_verified boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_creator boolean; v_terms text;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND is_admin=true) THEN
    RETURN jsonb_build_object('ok',false,'error','no_autorizado');
  END IF;
  SELECT is_creator,creator_terms_version INTO v_creator,v_terms FROM public.profiles WHERE id=p_user_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','usuario_no_encontrado'); END IF;
  IF p_verified AND coalesce(v_creator,false) IS NOT TRUE THEN
    RETURN jsonb_build_object('ok',false,'error','creator_required');
  END IF;
  IF p_verified AND coalesce(v_terms,'')<>'1.0' THEN
    RETURN jsonb_build_object('ok',false,'error','terms_required');
  END IF;
  UPDATE public.profiles SET
    is_creator_verified=p_verified,
    creator_verified_at=CASE WHEN p_verified THEN now() ELSE NULL END,
    creator_verified_by=CASE WHEN p_verified THEN auth.uid() ELSE NULL END
  WHERE id=p_user_id;
  RETURN jsonb_build_object('ok',true,'verified',p_verified);
END;
$$;

REVOKE ALL ON FUNCTION public.get_my_creator_program_status() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.accept_creator_program_terms(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_set_creator_access(uuid,boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_set_creator_program_verified(uuid,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_creator_program_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_creator_program_terms(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_creator_access(uuid,boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_creator_program_verified(uuid,boolean) TO authenticated;

COMMIT;

SELECT version,title,effective_at,active FROM public.creator_program_terms ORDER BY effective_at DESC;
