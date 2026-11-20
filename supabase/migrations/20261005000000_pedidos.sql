-- Pedidos del «Mapa de Energía» (Stripe Checkout, pago único de 11 USD).
-- Los escribe api/stripe-webhook.ts con la service role. RLS activo SIN
-- políticas: ni anon ni authenticated pueden leer ni escribir. Contiene
-- correos de compradores.
-- stripe_session_id es único: es la llave de idempotencia del webhook.
CREATE TABLE public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT NOT NULL UNIQUE,
  stripe_payment_intent TEXT,
  email TEXT,
  nombre TEXT,
  nahual_slug TEXT NOT NULL,
  nahual TEXT,
  kin_slug TEXT NOT NULL,
  tono INTEGER CHECK (tono IS NULL OR (tono >= 1 AND tono <= 13)),
  fecha_nacimiento DATE,
  monto_centavos INTEGER,
  moneda TEXT,
  entrega_estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (entrega_estado IN ('pendiente', 'entregado')),
  entrega_detalle TEXT,
  entregado_en TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pedidos_entrega_pendiente ON public.pedidos (created_at) WHERE entrega_estado = 'pendiente';

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pedidos FROM anon, authenticated;

CREATE TRIGGER update_pedidos_updated_at
  BEFORE UPDATE ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
