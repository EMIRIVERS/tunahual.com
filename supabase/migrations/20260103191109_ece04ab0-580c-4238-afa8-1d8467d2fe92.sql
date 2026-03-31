-- ============================================
-- NAHUALES TABLE - Los 20 signos del calendario maya
-- ============================================
CREATE TABLE public.nahuales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  index_num INTEGER NOT NULL UNIQUE CHECK (index_num >= 0 AND index_num <= 19),
  nombre TEXT NOT NULL,
  significado TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  elemento TEXT NOT NULL,
  animal_guia TEXT NOT NULL,
  punto_cardinal TEXT NOT NULL,
  color_maiz TEXT NOT NULL,
  parte_cuerpo TEXT NOT NULL,
  lugar_poder TEXT NOT NULL,
  elemento_conexion TEXT NOT NULL,
  cualidades TEXT[] DEFAULT '{}',
  sombras TEXT[] DEFAULT '{}',
  fecundado_en TEXT,
  icon_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- TONOS TABLE - Los 13 tonos del calendario
-- ============================================
CREATE TABLE public.tonos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero INTEGER NOT NULL UNIQUE CHECK (numero >= 1 AND numero <= 13),
  nombre TEXT NOT NULL,
  significado TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  cualidades TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- CONOCIMIENTO EXPANDIDO - Sabiduría profunda de cada nahual
-- ============================================
CREATE TABLE public.nahual_conocimiento_expandido (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nahual_id UUID NOT NULL REFERENCES public.nahuales(id) ON DELETE CASCADE,
  nombre_completo TEXT NOT NULL,
  significado_profundo TEXT NOT NULL,
  ceremonias_rituales TEXT NOT NULL,
  fecundado_en TEXT NOT NULL,
  mensaje_espiritual TEXT NOT NULL,
  polaridad_positiva TEXT[] DEFAULT '{}',
  polaridad_negativa TEXT[] DEFAULT '{}',
  trabajo_espiritual TEXT NOT NULL,
  relacion_naturaleza TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(nahual_id)
);

-- ============================================
-- GUARDIANES - Deidades y fuerzas espirituales mayas
-- ============================================
CREATE TABLE public.guardianes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  nombre_maya TEXT NOT NULL,
  significado TEXT NOT NULL,
  invocacion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- CONCEPTOS FUNDAMENTALES - Cosmovisión maya
-- ============================================
CREATE TABLE public.conceptos_fundamentales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  nombre_maya TEXT,
  descripcion TEXT NOT NULL,
  ensenanza TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- USER ROLES - Para autenticación admin
-- ============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- ============================================
-- FUNCIÓN PARA VERIFICAR ROLES
-- ============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- ============================================
-- FUNCIÓN PARA ACTUALIZAR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers para updated_at
CREATE TRIGGER update_nahuales_updated_at
  BEFORE UPDATE ON public.nahuales
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tonos_updated_at
  BEFORE UPDATE ON public.tonos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conocimiento_updated_at
  BEFORE UPDATE ON public.nahual_conocimiento_expandido
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_guardianes_updated_at
  BEFORE UPDATE ON public.guardianes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conceptos_updated_at
  BEFORE UPDATE ON public.conceptos_fundamentales
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE public.nahuales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tonos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nahual_conocimiento_expandido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardianes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conceptos_fundamentales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - Lectura pública para datos maya
-- ============================================
CREATE POLICY "Nahuales are publicly readable"
  ON public.nahuales FOR SELECT
  USING (true);

CREATE POLICY "Tonos are publicly readable"
  ON public.tonos FOR SELECT
  USING (true);

CREATE POLICY "Conocimiento is publicly readable"
  ON public.nahual_conocimiento_expandido FOR SELECT
  USING (true);

CREATE POLICY "Guardianes are publicly readable"
  ON public.guardianes FOR SELECT
  USING (true);

CREATE POLICY "Conceptos are publicly readable"
  ON public.conceptos_fundamentales FOR SELECT
  USING (true);

-- ============================================
-- RLS POLICIES - Solo admin puede modificar
-- ============================================
CREATE POLICY "Only admins can insert nahuales"
  ON public.nahuales FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update nahuales"
  ON public.nahuales FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete nahuales"
  ON public.nahuales FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert tonos"
  ON public.tonos FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update tonos"
  ON public.tonos FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete tonos"
  ON public.tonos FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert conocimiento"
  ON public.nahual_conocimiento_expandido FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update conocimiento"
  ON public.nahual_conocimiento_expandido FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete conocimiento"
  ON public.nahual_conocimiento_expandido FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert guardianes"
  ON public.guardianes FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update guardianes"
  ON public.guardianes FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete guardianes"
  ON public.guardianes FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert conceptos"
  ON public.conceptos_fundamentales FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update conceptos"
  ON public.conceptos_fundamentales FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete conceptos"
  ON public.conceptos_fundamentales FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- RLS POLICIES - User roles (solo admin ve/modifica)
-- ============================================
CREATE POLICY "Admins can read user_roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert user_roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update user_roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete user_roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- RLS POLICIES - Leads (solo admin puede leer)
-- ============================================
DROP POLICY IF EXISTS "Service role can read leads" ON public.leads;

CREATE POLICY "Only admins can read leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));