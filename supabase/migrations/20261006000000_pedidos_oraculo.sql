-- «Tu Mapa de Energía» pasa a ser el Oráculo Maya en PDF generado a pedido.
-- Datos nuevos de cada pedido y estado de la generación asíncrona (fuera del webhook).
-- NO aplicada: se aplica junto con la activación del cobro. pedidos sigue con RLS
-- sin políticas (solo service role).
--
-- genero         lo elige quien compra (Mujer / Hombre / Prefiero no decirlo = neutro).
--                Define la redacción; el bloque de útero y cérvix es solo para 'mujer'.
-- fecha_compra   día de la compra (zona ORACULO_TZ): su energía abre el Oráculo.
-- pdf_path       ruta dentro del bucket PRIVADO «oraculos» de Supabase Storage.
-- generacion_*   cola: pendiente -> generando -> listo | fallido (se reintenta con intentos < 3).
ALTER TABLE public.pedidos
  ADD COLUMN genero TEXT CHECK (genero IS NULL OR genero IN ('mujer', 'hombre', 'neutro')),
  ADD COLUMN fecha_compra DATE,
  ADD COLUMN pdf_path TEXT,
  ADD COLUMN generacion_estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (generacion_estado IN ('pendiente', 'generando', 'listo', 'fallido')),
  ADD COLUMN generacion_intentos INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN generacion_detalle TEXT,
  ADD COLUMN generado_en TIMESTAMPTZ;

CREATE INDEX idx_pedidos_generacion_pendiente ON public.pedidos (created_at) WHERE generacion_estado IN ('pendiente', 'fallido');
