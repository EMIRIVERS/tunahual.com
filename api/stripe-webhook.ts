import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { sendToKajabi } from "./kajabi.js";

/** Stripe firma el cuerpo EXACTO: hay que leerlo crudo, sin que Vercel lo parsee. */
export const config = { api: { bodyParser: false } };

export type EntregaEstado = "pendiente" | "entregado";

export interface Pedido {
  stripe_session_id: string;
  stripe_payment_intent: string | null;
  email: string | null;
  nombre: string | null;
  nahual_slug: string;
  nahual: string | null;
  kin_slug: string;
  tono: number | null;
  fecha_nacimiento: string | null;
  /** Elegido en el formulario; null si el pedido no lo trae (el PDF usa texto neutro). */
  genero: "mujer" | "hombre" | "neutro" | null;
  /** Día de la compra (YYYY-MM-DD) en la zona del negocio: la energía del día que cuenta el Oráculo. */
  fecha_compra: string | null;
  monto_centavos: number | null;
  moneda: string | null;
}

export interface PedidoGuardado extends Pedido {
  entrega_estado: EntregaEstado;
}

/** Almacén de pedidos. En producción es la tabla `pedidos` de Supabase (solo service role). */
export interface PedidosStore {
  /** Inserta el pedido. `created: false` si el session id ya existía (evento duplicado). */
  insertar(p: Pedido): Promise<{ created: true } | { created: false; existente: PedidoGuardado }>;
  marcar(sessionId: string, estado: EntregaEstado, detalle: string): Promise<void>;
}

export interface EntregaResult {
  estado: EntregaEstado;
  detalle: string;
}

export interface WebhookDeps {
  secretKey?: string;
  webhookSecret?: string;
  stripe?: Pick<Stripe, "webhooks">;
  /** `null` = no hay credenciales de Supabase; el webhook responde 503 para que Stripe reintente. */
  store?: PedidosStore | null;
  entregar?: (p: Pedido) => Promise<EntregaResult>;
  logger?: Pick<Console, "error">;
}

export type WebhookResult = { status: 200 | 400 | 503; body: Record<string, unknown> };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** YYYY-MM-DD de un instante de Stripe en la zona del negocio (ORACULO_TZ, por defecto Ciudad de México). */
export function fechaCompraISO(epochSegundos: number | null | undefined, zona = process.env.ORACULO_TZ || "America/Mexico_City"): string | null {
  if (!epochSegundos) return null;
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: zona, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(epochSegundos * 1000));
  } catch {
    return null; // zona inválida: mejor sin fecha que una fecha equivocada
  }
}

/** Convierte la sesión de Stripe en el pedido a guardar. Null si no es del Mapa. */
export function pedidoDesdeSesion(s: Stripe.Checkout.Session): Pedido | null {
  const m = s.metadata ?? {};
  if (m.producto !== "mapa-energia") return null;
  const email = (s.customer_details?.email || s.customer_email || "").trim().toLowerCase();
  const tono = Number(m.tono);
  return {
    stripe_session_id: s.id,
    stripe_payment_intent: typeof s.payment_intent === "string" ? s.payment_intent : (s.payment_intent?.id ?? null),
    email: EMAIL_RE.test(email) ? email : null,
    nombre: (s.customer_details?.name || m.nombre || "").trim() || null,
    nahual_slug: m.nahual_slug || "",
    nahual: m.nahual || null,
    kin_slug: m.kin_slug || "",
    tono: Number.isInteger(tono) ? tono : null,
    fecha_nacimiento: m.fecha_nacimiento || null,
    genero: m.genero === "mujer" || m.genero === "hombre" || m.genero === "neutro" ? m.genero : null,
    fecha_compra: fechaCompraISO(s.created),
    monto_centavos: s.amount_total ?? null,
    moneda: s.currency ?? null,
  };
}

/**
 * Procesa un evento de Stripe. Responde 200 en cuanto el pedido queda
 * registrado, aunque la entrega quede pendiente: un 5xx haría que Stripe
 * reintente y duplicara el intento de envío. Idempotente por session id.
 */
export async function procesarWebhook(
  rawBody: string | Buffer,
  signature: string | undefined,
  deps: WebhookDeps = {}
): Promise<WebhookResult> {
  const secretKey = deps.secretKey ?? process.env.STRIPE_SECRET_KEY;
  const webhookSecret = deps.webhookSecret ?? process.env.STRIPE_WEBHOOK_SECRET;
  const logger = deps.logger ?? console;

  if ((!secretKey && !deps.stripe) || !webhookSecret) {
    return { status: 503, body: { error: "Stripe no está configurado." } };
  }
  if (!signature) return { status: 400, body: { error: "falta la firma" } };

  const stripe = deps.stripe ?? new Stripe(secretKey as string);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`[stripe-webhook] firma inválida: ${message}`);
    return { status: 400, body: { error: "firma inválida" } };
  }

  if (event.type !== "checkout.session.completed") {
    return { status: 200, body: { received: true, ignored: event.type } };
  }
  const session = event.data.object as Stripe.Checkout.Session;
  // Pagos diferidos (transferencia, OXXO): aún no hay dinero; no se entrega.
  if (session.payment_status !== "paid") {
    return { status: 200, body: { received: true, ignored: `payment_status=${session.payment_status}` } };
  }
  const pedido = pedidoDesdeSesion(session);
  if (!pedido) return { status: 200, body: { received: true, ignored: "otro producto" } };

  const store = deps.store === undefined ? crearStoreSupabase() : deps.store;
  if (!store) {
    // Sin dónde registrar no se puede garantizar idempotencia: que Stripe reintente.
    logger.error(`[stripe-webhook] sin credenciales de Supabase; sesión ${pedido.stripe_session_id} sin registrar`);
    return { status: 503, body: { error: "sin base de pedidos" } };
  }

  const alta = await store.insertar(pedido);
  if ("existente" in alta && alta.existente.entrega_estado === "entregado") {
    return { status: 200, body: { received: true, duplicate: true } };
  }

  const entregar = deps.entregar ?? (process.env.ORACULO_PDF_HABILITADO === "1" ? encolarOraculo : entregarMapa);
  let entrega: EntregaResult;
  try {
    entrega = await entregar(pedido);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`[stripe-webhook] entrega lanzó sesión=${pedido.stripe_session_id} error=${message}`);
    entrega = { estado: "pendiente", detalle: `excepción: ${message}` };
  }
  await store.marcar(pedido.stripe_session_id, entrega.estado, entrega.detalle);

  return {
    status: 200,
    body: { received: true, duplicate: !alta.created, entrega: entrega.estado },
  };
}

/* ───────────────────────── Entrega ───────────────────────── */

/**
 * Con ORACULO_PDF_HABILITADO=1 el PDF se genera a pedido, FUERA del webhook:
 * aquí solo se avisa a api/generar-oraculo (ver docs/oraculo-asincrono.md). El
 * aviso es de mejor esfuerzo y nunca bloquea al webhook; si no llega, el pedido
 * queda `pendiente` y lo recoge el cron diario o la ruta manual.
 */
export async function encolarOraculo(
  p: Pedido,
  env: Record<string, string | undefined> = process.env,
  fetchImpl: typeof fetch = fetch,
  logger: Pick<Console, "error"> = console
): Promise<EntregaResult> {
  if (!env.ORACULO_TOKEN) return { estado: "pendiente", detalle: "falta ORACULO_TOKEN: Oráculo sin encolar" };
  const base = (env.ORACULO_FUNCION_URL || "https://www.tunahual.com").replace(/\/+$/, "");
  try {
    await fetchImpl(`${base}/api/generar-oraculo`, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.ORACULO_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: p.stripe_session_id }),
      signal: AbortSignal.timeout(2500),
    });
  } catch (err) {
    // Un tiempo agotado es lo esperado: la generación sigue en su propia función.
    const message = err instanceof Error ? err.message : String(err);
    const agotado = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    if (!agotado) logger.error(`[stripe-webhook] no se pudo avisar a generar-oraculo sesión=${p.stripe_session_id}: ${message}`);
  }
  return { estado: "pendiente", detalle: "generación del Oráculo encolada" };
}

const escapeHtml = (t: string) =>
  String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

/**
 * Entrega el Mapa: correo con el PDF adjunto (Resend) y etiqueta en Kajabi.
 * Solo el correo con PDF cuenta como «entregado»; la etiqueta de Kajabi es
 * un aviso adicional. Si falta cualquier variable, queda «pendiente» con el
 * motivo, para reprocesar a mano. NUNCA lanza hacia el visitante.
 */
export async function entregarMapa(
  p: Pedido,
  env: Record<string, string | undefined> = process.env,
  fetchImpl: typeof fetch = fetch,
  logger: Pick<Console, "error"> = console
): Promise<EntregaResult> {
  const notas: string[] = [];

  // Etiqueta en Kajabi (best-effort): permite escribirle a quien compró.
  if (p.email) {
    const k = await sendToKajabi(
      { nombre: p.nombre || "Cliente", email: p.email, nahualSlug: p.nahual_slug, tono: p.tono, fecha_nacimiento: p.fecha_nacimiento, etiquetas: ["mapa-energia"] },
      env.KAJABI_WEBHOOK_URL,
      fetchImpl,
      logger
    );
    notas.push("reason" in k ? `kajabi: ${k.reason}` : "kajabi: etiquetado");
  }

  const faltan = [
    !p.email && "correo del comprador",
    !env.RESEND_API_KEY && "RESEND_API_KEY",
    !env.MAPA_PDF_BASE_URL && "MAPA_PDF_BASE_URL",
    !p.kin_slug && "kin_slug",
  ].filter(Boolean);
  if (faltan.length) {
    return { estado: "pendiente", detalle: [`faltan: ${faltan.join(", ")}`, ...notas].join(" | ") };
  }

  const base = (env.MAPA_PDF_BASE_URL as string).replace(/\/+$/, "");
  const archivo = `mapa-${p.kin_slug}.pdf`;
  const from = env.EMAIL_FROM || "Tu Nahual <tu-nahual@tunahual.com>";
  const titulo = [p.tono, p.nahual].filter(Boolean).join(" ") || "Tu Mapa de Energía";

  try {
    const r = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: p.email,
        subject: `Tu Mapa de Energía: ${titulo}`,
        html: correoMapaHTML(p.nombre, titulo),
        attachments: [{ filename: `Tu-Mapa-de-Energia-${p.kin_slug}.pdf`, path: `${base}/${archivo}` }],
      }),
    });
    if (!r.ok) {
      const cuerpo = await r.text().catch(() => "");
      logger.error(`[stripe-webhook] Resend ${r.status} sesión=${p.stripe_session_id} body=${cuerpo}`);
      return { estado: "pendiente", detalle: [`resend ${r.status}`, ...notas].join(" | ") };
    }
    return { estado: "entregado", detalle: [`correo enviado (${archivo})`, ...notas].join(" | ") };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`[stripe-webhook] Resend excepción sesión=${p.stripe_session_id} error=${message}`);
    return { estado: "pendiente", detalle: [`resend: ${message}`, ...notas].join(" | ") };
  }
}

/** Correo editorial sobrio, misma paleta bronce/oro + crema que send-reading. */
function correoMapaHTML(nombre: string | null, titulo: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Tu Mapa de Energía</title></head>
<body style="margin:0;padding:0;background-color:#faf8f3;color:#3d3d3d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',sans-serif;line-height:1.6;">
  <div style="max-width:600px;margin:0 auto;background-color:#fff9f3;border:1px solid #e8dcc8;">
    <div style="background:linear-gradient(135deg,#a3732b 0%,#d4a574 100%);padding:44px 30px;text-align:center;color:#fff9f3;">
      <p style="font-size:13px;letter-spacing:4px;text-transform:uppercase;opacity:0.95;margin:0 0 8px;">Cholq'ij</p>
      <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:normal;margin:0;">Tu Mapa de Energía</h1>
    </div>
    <div style="padding:40px 30px;">
      <p style="font-size:16px;margin:0 0 20px;">${nombre ? `Hola <strong style="color:#a3732b;">${escapeHtml(nombre)}</strong>,` : "Hola,"}</p>
      <p style="font-size:15px;margin:0 0 20px;">Gracias por tu compra. Tu Mapa de Energía de <strong>${escapeHtml(titulo)}</strong> va adjunto a este correo, en PDF.</p>
      <p style="font-size:15px;margin:0;">Guárdalo y vuelve a él cuando lo necesites.</p>
    </div>
    <div style="background-color:#fef5ed;padding:24px;text-align:center;border-top:1px solid #e8dcc8;">
      <p style="margin:0;font-size:12px;color:#b8a98f;">tunahual.com · Azul Anaité</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/* ───────────────────────── Supabase ───────────────────────── */

/**
 * Almacén sobre PostgREST con la service role. La tabla `pedidos` tiene RLS
 * sin políticas: solo esta llave puede tocarla. Null si faltan variables.
 */
export function crearStoreSupabase(
  env: Record<string, string | undefined> = process.env,
  fetchImpl: typeof fetch = fetch
): PedidosStore | null {
  const url = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  const tabla = `${url}/rest/v1/pedidos`;

  return {
    async insertar(p) {
      const r = await fetchImpl(`${tabla}?on_conflict=stripe_session_id`, {
        method: "POST",
        headers: { ...headers, Prefer: "resolution=ignore-duplicates,return=representation" },
        body: JSON.stringify(p),
      });
      if (!r.ok) throw new Error(`pedidos insert ${r.status}: ${await r.text().catch(() => "")}`);
      const filas = (await r.json()) as unknown[];
      if (filas.length > 0) return { created: true };

      const g = await fetchImpl(`${tabla}?stripe_session_id=eq.${encodeURIComponent(p.stripe_session_id)}&select=*`, { headers });
      if (!g.ok) throw new Error(`pedidos select ${g.status}`);
      const [existente] = (await g.json()) as PedidoGuardado[];
      return { created: false, existente: existente ?? { ...p, entrega_estado: "pendiente" } };
    },
    async marcar(sessionId, estado, detalle) {
      const r = await fetchImpl(`${tabla}?stripe_session_id=eq.${encodeURIComponent(sessionId)}`, {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify({
          entrega_estado: estado,
          entrega_detalle: detalle.slice(0, 500),
          entregado_en: estado === "entregado" ? new Date().toISOString() : null,
        }),
      });
      if (!r.ok) throw new Error(`pedidos update ${r.status}`);
    },
  };
}

/* ───────────────────────── Handler ───────────────────────── */

async function leerCuerpoCrudo(req: VercelRequest): Promise<Buffer> {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return Buffer.from(req.body);
  const trozos: Buffer[] = [];
  for await (const t of req as AsyncIterable<Buffer | string>) trozos.push(Buffer.from(t));
  return Buffer.concat(trozos);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const raw = await leerCuerpoCrudo(req);
  const firma = req.headers["stripe-signature"];
  try {
    const result = await procesarWebhook(raw, Array.isArray(firma) ? firma[0] : firma);
    return res.status(result.status).json(result.body);
  } catch (err) {
    // Fallo inesperado (p. ej. Supabase caído): 500 para que Stripe reintente.
    console.error("[stripe-webhook] error inesperado:", err);
    return res.status(500).json({ error: "error interno" });
  }
}
