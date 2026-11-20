import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { origenPermitido } from "./_lib/origen.js";

export interface CheckoutInput {
  /** Slug del kin ya normalizado en el cliente (ej. "7-aqabal"). */
  kinSlug?: unknown;
  nahualSlug?: unknown;
  tono?: unknown;
  nahual?: unknown;
  fecha_nacimiento?: unknown;
  nombre?: unknown;
  /** «mujer» | «hombre» | «neutro» (Prefiero no decirlo). Obligatorio: define la redacción del PDF. */
  genero?: unknown;
  /** Opcional: solo precarga el correo; si falta, Stripe lo pide en su página. */
  email?: unknown;
}

export interface CheckoutClean {
  kinSlug: string;
  nahualSlug: string;
  tono: number;
  nahual: string;
  fecha_nacimiento: string;
  nombre: string;
  genero: Genero;
  email: string | null;
}

/** Mismos valores que src/lib/oraculo/genero.ts (una prueba vigila que no se separen). */
export const GENEROS = ["mujer", "hombre", "neutro"] as const;
export type Genero = (typeof GENEROS)[number];

const KIN_RE = /^(1[0-3]|[1-9])-[a-z]{1,12}$/;
const SLUG_RE = /^[a-z]{1,12}$/;
const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SITIO = "https://www.tunahual.com";
/** 11 USD en centavos: precio de respaldo si no hay STRIPE_PRICE_ID. */
export const PRECIO_MAPA_CENTAVOS = 1100;

type Limpieza = { ok: true; data: CheckoutClean } | { ok: false; error: string };

/** Valida y acota la entrada. Nunca confía en el cliente para nada que vaya a Stripe. */
export function limpiarEntrada(input: CheckoutInput): Limpieza {
  const kinSlug = typeof input.kinSlug === "string" ? input.kinSlug.trim().toLowerCase() : "";
  if (!KIN_RE.test(kinSlug)) return { ok: false, error: "kinSlug inválido" };

  const nahualSlug = typeof input.nahualSlug === "string" ? input.nahualSlug.trim().toLowerCase() : "";
  // El slug del nahual es lo que sigue al tono dentro del kin: deben coincidir.
  if (!SLUG_RE.test(nahualSlug) || kinSlug.split("-")[1] !== nahualSlug) {
    return { ok: false, error: "nahualSlug inválido" };
  }

  const tono = Number(input.tono);
  if (!Number.isInteger(tono) || tono < 1 || tono > 13 || String(tono) !== kinSlug.split("-")[0]) {
    return { ok: false, error: "tono inválido" };
  }

  const fecha = typeof input.fecha_nacimiento === "string" ? input.fecha_nacimiento.trim() : "";
  if (!FECHA_RE.test(fecha) || Number.isNaN(Date.parse(fecha))) {
    return { ok: false, error: "fecha_nacimiento inválida" };
  }

  const genero = typeof input.genero === "string" ? input.genero.trim().toLowerCase() : "";
  if (!(GENEROS as readonly string[]).includes(genero)) return { ok: false, error: "genero inválido" };

  const emailRaw = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  if (emailRaw && (emailRaw.length > 255 || !EMAIL_RE.test(emailRaw))) {
    return { ok: false, error: "email inválido" };
  }

  const cap = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

  return {
    ok: true,
    data: {
      kinSlug,
      nahualSlug,
      tono,
      nahual: cap(input.nahual, 60),
      fecha_nacimiento: fecha,
      nombre: cap(input.nombre, 100),
      genero: genero as Genero,
      email: emailRaw || null,
    },
  };
}

export type CheckoutResult =
  | { status: 200; body: { url: string } }
  | { status: 400 | 502 | 503; body: { error: string } };

export interface CheckoutDeps {
  /** Interruptor de servidor. Por defecto CHECKOUT_HABILITADO=1; sin él NO se crea ninguna sesión, aunque haya llaves. */
  habilitado?: boolean;
  secretKey?: string;
  priceId?: string;
  /** Inyectable en pruebas; en producción se arma con STRIPE_SECRET_KEY. */
  stripe?: Pick<Stripe, "checkout">;
  logger?: Pick<Console, "error">;
}

/**
 * Crea la Checkout Session del Mapa de Energía (pago único, una línea).
 * Sin STRIPE_SECRET_KEY responde 503 claro en vez de reventar: así el sitio
 * puede desplegarse antes de que Azul Anaité entregue sus llaves.
 */
export async function createCheckoutSession(input: CheckoutInput, deps: CheckoutDeps = {}): Promise<CheckoutResult> {
  const secretKey = deps.secretKey ?? process.env.STRIPE_SECRET_KEY;
  const priceId = deps.priceId ?? process.env.STRIPE_PRICE_ID;
  const logger = deps.logger ?? console;

  // Sin el interruptor el cobro está cerrado: tener STRIPE_SECRET_KEY en Vercel no basta para vender.
  const habilitado = deps.habilitado ?? process.env.CHECKOUT_HABILITADO === "1";
  if (!habilitado || (!secretKey && !deps.stripe)) {
    return { status: 503, body: { error: "El cobro aún no está disponible." } };
  }

  const limpio = limpiarEntrada(input);
  if ("error" in limpio) return { status: 400, body: { error: limpio.error } };
  const d = limpio.data;

  const stripe = deps.stripe ?? new Stripe(secretKey as string);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        priceId
          ? { price: priceId, quantity: 1 }
          : {
              quantity: 1,
              price_data: {
                currency: "usd",
                unit_amount: PRECIO_MAPA_CENTAVOS,
                product_data: { name: "Tu Mapa de Energía" },
              },
            },
      ],
      ...(d.email ? { customer_email: d.email } : {}),
      locale: "es",
      metadata: {
        producto: "mapa-energia",
        kin_slug: d.kinSlug,
        nahual_slug: d.nahualSlug,
        tono: String(d.tono),
        nahual: d.nahual,
        fecha_nacimiento: d.fecha_nacimiento,
        nombre: d.nombre,
        genero: d.genero,
      },
      // Una sesión sin pagar no queda abierta más de 30 min (el mínimo de Stripe), en vez de 24 h.
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      success_url: `${SITIO}/gracias?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITIO}/resultado/${d.kinSlug}`,
    });

    if (!session.url) {
      logger.error(`[create-checkout] sesión ${session.id} sin url`);
      return { status: 502, body: { error: "No se pudo iniciar el pago." } };
    }
    return { status: 200, body: { url: session.url } };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`[create-checkout] Stripe falló kin=${d.kinSlug} error=${message}`);
    return { status: 502, body: { error: "No se pudo iniciar el pago." } };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Anti-abuso: solo peticiones del sitio. No es un control fuerte (el encabezado es falsificable):
  // el cierre real es CHECKOUT_HABILITADO.
  const origin = String(req.headers.origin || req.headers.referer || "");
  if (!origenPermitido(origin)) {
    return res.status(403).json({ error: "forbidden" });
  }

  const result = await createCheckoutSession(req.body ?? {});
  return res.status(result.status).json(result.body);
}
