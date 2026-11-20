import type { VercelRequest, VercelResponse } from "@vercel/node";
import { join } from "node:path";
import { readdirSync, readFileSync } from "node:fs";
import { timingSafeEqual } from "node:crypto";
import { Contenido, fuenteDeDisco } from "../../src/lib/oraculo/contenido.js";
import { construirOraculo, valoresDe, type DatosOraculo } from "../../src/lib/oraculo/maqueta.js";
import { esGenero, type Genero } from "../../src/lib/oraculo/genero.js";
import { htmlAPdf } from "../../src/lib/oraculo/render.js";

/**
 * Generación ASÍNCRONA del Oráculo (PDF a pedido), fuera del webhook de Stripe.
 *
 * ESTADO: publicada en `api/generar-oraculo.ts` (que reexporta este módulo; la carpeta
 * `_oraculo` no se publica sola por el prefijo «_»), pero apagada hasta
 * ORACULO_PDF_HABILITADO=1. Ver docs/oraculo-asincrono.md y docs/activar-ventas.md.
 *
 * Flujo: el webhook guarda el pedido (generacion_estado = pendiente) y avisa a
 * esta función; ella toma el pedido con un bloqueo optimista, arma el PDF,
 * lo sube a un bucket PRIVADO de Supabase Storage, firma un enlace de 7 días
 * y manda el correo por Resend. Si falla queda «fallido» y se reintenta
 * (máx. 3 intentos); un cron diario y la ruta manual recogen los pendientes.
 */

export const MAX_INTENTOS = 3;
/** Un «generando» sin avance en este lapso se considera huérfano (la función murió) y se puede retomar. */
export const MINUTOS_HUERFANO = 10;
export const BUCKET = "oraculos";
export const VIGENCIA_ENLACE_S = 7 * 24 * 3600;
/** Por encima de esto el PDF no va adjunto: solo el enlace firmado. */
export const MAX_ADJUNTO_BYTES = 8 * 1024 * 1024;

export type EstadoGeneracion = "pendiente" | "generando" | "listo" | "fallido";

export interface PedidoGeneracion {
  stripe_session_id: string;
  email: string | null;
  nombre: string | null;
  genero: Genero | null;
  fecha_nacimiento: string | null;
  fecha_compra: string | null;
  generacion_estado: EstadoGeneracion;
  generacion_intentos: number;
  updated_at: string;
}

export interface StorePedidos {
  leer(sessionId: string): Promise<PedidoGeneracion | null>;
  /** Bloqueo optimista: true si ESTE proceso quedó con el pedido. */
  tomar(p: PedidoGeneracion): Promise<boolean>;
  marcar(sessionId: string, cambios: Record<string, unknown>): Promise<void>;
  pendientes(limite: number, antesDeISO: string): Promise<PedidoGeneracion[]>;
}

export interface Dependencias {
  store: StorePedidos;
  /** Contenido para un género y valores dados (en producción, content/oraculo del disco). */
  contenido: (genero: Genero, valores: Record<string, string>) => Contenido;
  renderizar: (html: string) => Promise<Buffer>;
  storage: { subir(ruta: string, pdf: Buffer): Promise<void>; firmar(ruta: string, segundos: number): Promise<string> };
  correo: (m: { para: string; nombre: string; pdf: Buffer; enlace: string; adjuntar: boolean }) => Promise<void>;
  ahora?: () => Date;
  logger?: Pick<Console, "error">;
  /** Solo pruebas en Preview (ORACULO_SIN_CORREO): el correo es un no-op y el detalle del pedido lo dice. */
  sinCorreo?: boolean;
  /** Si es true, se rechaza generar mientras haya texto sin `revision: aprobada`. */
  exigirAprobado?: boolean;
}

export type ResultadoGeneracion =
  | { estado: "listo"; ruta: string; bytes: number; ms: number }
  | { estado: "omitido"; motivo: string }
  | { estado: "fallido"; error: string; reintentable: boolean };

const rutaPdf = (sessionId: string) => `${sessionId}.pdf`;

/** Comparación de secretos en tiempo constante (no revela cuántos caracteres acertó quien prueba). */
export function igualesSeguro(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function oraculoHabilitado(env: Record<string, string | undefined> = process.env): boolean {
  return env.ORACULO_PDF_HABILITADO === "1";
}

/**
 * `ORACULO_PERMITIR_BORRADOR=1` salta la exigencia de `revision: aprobada`. Es solo para
 * pruebas de rendimiento en Preview: en Production (VERCEL_ENV=production) se ignora aunque exista.
 */
export function borradorPermitido(env: Record<string, string | undefined> = process.env): boolean {
  return env.ORACULO_PERMITIR_BORRADOR === "1" && env.VERCEL_ENV !== "production";
}

/** Suma del RSS (MB) de todos los procesos del contenedor, leída de /proc. 0 si no hay /proc (macOS). */
export function rssTotalMB(): number {
  try {
    let kb = 0;
    for (const pid of readdirSync("/proc").filter((d) => /^\d+$/.test(d))) {
      try {
        const m = /VmRSS:\s+(\d+) kB/.exec(readFileSync(`/proc/${pid}/status`, "utf8"));
        if (m) kb += Number(m[1]);
      } catch {
        /* el proceso terminó entre el listado y la lectura */
      }
    }
    return Math.round(kb / 1024);
  } catch {
    return 0;
  }
}

/** Renderiza y registra el pico de RSS total (Node + Chromium) muestreado cada 150 ms, para dimensionar la función. */
async function renderizarMedido(html: string): Promise<Buffer> {
  let pico = rssTotalMB();
  const t = setInterval(() => (pico = Math.max(pico, rssTotalMB())), 150);
  const t0 = Date.now();
  try {
    return (await htmlAPdf(html)).pdf;
  } finally {
    clearInterval(t);
    console.log(`[oraculo] render ${Date.now() - t0} ms, pico RSS total ${pico} MB`);
  }
}

/** Igual que el borrador: solo fuera de producción. Permite probar la generación sin dominio verificado en Resend. */
export function sinCorreoPermitido(env: Record<string, string | undefined> = process.env): boolean {
  return env.ORACULO_SIN_CORREO === "1" && env.VERCEL_ENV !== "production";
}

function esHuerfano(p: PedidoGeneracion, ahora: Date): boolean {
  return p.generacion_estado === "generando" && ahora.getTime() - new Date(p.updated_at).getTime() > MINUTOS_HUERFANO * 60_000;
}

/**
 * Genera y entrega el Oráculo de un pedido. Idempotente: un pedido «listo» no
 * se regenera y dos procesos no pueden tomar el mismo pedido a la vez.
 */
export async function generarParaPedido(sessionId: string, d: Dependencias): Promise<ResultadoGeneracion> {
  const ahora = d.ahora ?? (() => new Date());
  const logger = d.logger ?? console;
  const t0 = Date.now();

  const p = await d.store.leer(sessionId);
  if (!p) return { estado: "omitido", motivo: "pedido inexistente" };
  if (p.generacion_estado === "listo") return { estado: "omitido", motivo: "ya generado" };
  if (p.generacion_estado === "generando" && !esHuerfano(p, ahora())) return { estado: "omitido", motivo: "otra ejecución lo está generando" };
  if (p.generacion_intentos >= MAX_INTENTOS) return { estado: "omitido", motivo: `agotó ${MAX_INTENTOS} intentos: revisar a mano` };
  if (!(await d.store.tomar(p))) return { estado: "omitido", motivo: "otra ejecución lo tomó primero" };

  const fallar = async (error: string, reintentable = true): Promise<ResultadoGeneracion> => {
    logger.error(`[oraculo] sesión=${sessionId} falló: ${error}`);
    await d.store.marcar(sessionId, { generacion_estado: "fallido", generacion_detalle: error.slice(0, 500) });
    return { estado: "fallido", error, reintentable };
  };

  try {
    if (!p.email) return await fallar("el pedido no trae correo", false);
    if (!p.fecha_nacimiento || !p.fecha_compra) return await fallar("faltan fecha de nacimiento o de compra", false);
    const nombre = (p.nombre ?? "").trim();
    if (!nombre) return await fallar("el pedido no trae nombre", false);
    // Sin género elegido se redacta en neutro: nunca se adivina.
    const genero: Genero = esGenero(p.genero) ? p.genero : "neutro";

    const datos: DatosOraculo = { nombre, fechaNacimiento: p.fecha_nacimiento, genero, fechaCompra: p.fecha_compra };
    const contenido = d.contenido(genero, valoresDe(datos));
    const armado = construirOraculo(datos, contenido, { marcaBorrador: false });
    if (d.exigirAprobado && armado.sinAprobar.length > 0) {
      return await fallar(`contenido sin aprobar por Azul (${armado.sinAprobar.length} archivos): no se entrega`, false);
    }

    const pdf = await d.renderizar(armado.html);
    const ruta = rutaPdf(sessionId);
    await d.storage.subir(ruta, pdf);
    const enlace = await d.storage.firmar(ruta, VIGENCIA_ENLACE_S);
    await d.correo({ para: p.email, nombre, pdf, enlace, adjuntar: pdf.length <= MAX_ADJUNTO_BYTES });

    await d.store.marcar(sessionId, {
      generacion_estado: "listo",
      generacion_detalle: `ok ${armado.kin}, ${Math.round(pdf.length / 1024)} KB`,
      pdf_path: ruta,
      generado_en: ahora().toISOString(),
      entrega_estado: "entregado",
      entrega_detalle: d.sinCorreo ? "PRUEBA: PDF generado, correo omitido (ORACULO_SIN_CORREO)" : "Oráculo enviado por correo",
      entregado_en: ahora().toISOString(),
    });
    return { estado: "listo", ruta, bytes: pdf.length, ms: Date.now() - t0 };
  } catch (err) {
    return fallar(err instanceof Error ? err.message : String(err));
  }
}

/* ───────────── Implementaciones reales (Supabase REST, Storage, Resend, Chromium) ───────────── */

type Env = Record<string, string | undefined>;

function supa(env: Env) {
  const url = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url, headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" } };
}

export function crearStore(env: Env = process.env, f: typeof fetch = fetch): StorePedidos | null {
  const s = supa(env);
  if (!s) return null;
  const tabla = `${s.url}/rest/v1/pedidos`;
  const cols = "stripe_session_id,email,nombre,genero,fecha_nacimiento,fecha_compra,generacion_estado,generacion_intentos,updated_at";
  return {
    async leer(id) {
      const r = await f(`${tabla}?stripe_session_id=eq.${encodeURIComponent(id)}&select=${cols}`, { headers: s.headers });
      if (!r.ok) throw new Error(`pedidos select ${r.status}`);
      return ((await r.json()) as PedidoGeneracion[])[0] ?? null;
    },
    async tomar(p) {
      // Optimista: solo gana quien encuentra el pedido tal como lo leyó.
      const filtro = `stripe_session_id=eq.${encodeURIComponent(p.stripe_session_id)}&generacion_estado=eq.${p.generacion_estado}&generacion_intentos=eq.${p.generacion_intentos}`;
      const r = await f(`${tabla}?${filtro}`, {
        method: "PATCH",
        headers: { ...s.headers, Prefer: "return=representation" },
        body: JSON.stringify({ generacion_estado: "generando", generacion_intentos: p.generacion_intentos + 1 }),
      });
      if (!r.ok) throw new Error(`pedidos lock ${r.status}`);
      return ((await r.json()) as unknown[]).length === 1;
    },
    async marcar(id, cambios) {
      const r = await f(`${tabla}?stripe_session_id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: s.headers, body: JSON.stringify(cambios) });
      if (!r.ok) throw new Error(`pedidos update ${r.status}`);
    },
    async pendientes(limite, antesDeISO) {
      const q = `or=(generacion_estado.eq.pendiente,generacion_estado.eq.fallido,and(generacion_estado.eq.generando,updated_at.lt.${antesDeISO}))&generacion_intentos=lt.${MAX_INTENTOS}&order=created_at.asc&limit=${limite}&select=${cols}`;
      const r = await f(`${tabla}?${q}`, { headers: s.headers });
      if (!r.ok) throw new Error(`pedidos pendientes ${r.status}`);
      return (await r.json()) as PedidoGeneracion[];
    },
  };
}

export function crearStorage(env: Env = process.env, f: typeof fetch = fetch): Dependencias["storage"] | null {
  const s = supa(env);
  if (!s) return null;
  return {
    async subir(ruta, pdf) {
      const r = await f(`${s.url}/storage/v1/object/${BUCKET}/${ruta}`, {
        method: "POST",
        headers: { ...s.headers, "Content-Type": "application/pdf", "x-upsert": "true" },
        body: new Uint8Array(pdf),
      });
      if (!r.ok) throw new Error(`storage subir ${r.status}: ${await r.text().catch(() => "")}`);
    },
    async firmar(ruta, segundos) {
      const r = await f(`${s.url}/storage/v1/object/sign/${BUCKET}/${ruta}`, { method: "POST", headers: s.headers, body: JSON.stringify({ expiresIn: segundos }) });
      if (!r.ok) throw new Error(`storage firmar ${r.status}`);
      const { signedURL } = (await r.json()) as { signedURL: string };
      return `${s.url}/storage/v1${signedURL}`;
    },
  };
}

const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function crearCorreo(env: Env = process.env, f: typeof fetch = fetch): Dependencias["correo"] | null {
  if (!env.RESEND_API_KEY) return null;
  const from = env.EMAIL_FROM || "Tu Nahual <tu-nahual@tunahual.com>";
  return async ({ para, nombre, pdf, enlace, adjuntar }) => {
    const r = await f("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: para,
        subject: "Tu Oráculo Maya",
        html: `<div style="font-family:Georgia,serif;color:#3d3d3d;max-width:560px;margin:0 auto;line-height:1.7"><p>Hola <strong style="color:#a3732b">${esc(nombre)}</strong>,</p><p>Tu Oráculo Maya está listo${adjuntar ? " y va adjunto a este correo, en PDF" : ""}.</p><p>También puedes abrirlo aquí durante 7 días: <a href="${esc(enlace)}" style="color:#a3732b">abrir mi Oráculo</a>.</p><p style="color:#b8a98f;font-size:12px">tunahual.com · Azul Anaité</p></div>`,
        ...(adjuntar ? { attachments: [{ filename: "Tu-Oraculo-Maya.pdf", content: pdf.toString("base64") }] } : {}),
      }),
    });
    if (!r.ok) throw new Error(`resend ${r.status}: ${await r.text().catch(() => "")}`);
  };
}

/** Dependencias de producción, o null + lista de lo que falta. */
export function dependenciasReales(env: Env = process.env): { deps: Dependencias } | { faltan: string[] } {
  const store = crearStore(env);
  const storage = crearStorage(env);
  const sinCorreo = sinCorreoPermitido(env);
  const correo = sinCorreo ? async () => {} : crearCorreo(env);
  const faltan = [!store && "SUPABASE_SERVICE_ROLE_KEY/URL", !correo && "RESEND_API_KEY"].filter(Boolean) as string[];
  if (!store || !storage || !correo) return { faltan };
  const raiz = join(process.cwd(), "content/oraculo");
  return {
    deps: {
      store,
      storage,
      correo,
      sinCorreo,
      contenido: (g, v) => new Contenido(fuenteDeDisco(raiz), g, v),
      renderizar: renderizarMedido,
      // Producción NO entrega borradores: hay que aprobar cada archivo en content/ (o forzarlo a conciencia).
      exigirAprobado: !borradorPermitido(env),
    },
  };
}

/* ───────────── Handler ───────────── */

/**
 * POST  { session_id }                 con  Authorization: Bearer ORACULO_TOKEN   -> genera ese pedido
 * GET   ?pendientes=1 [&n=2]           con  Authorization: Bearer CRON_SECRET      -> reprocesa pendientes (cron diario)
 * Sin token válido responde 401; con token pero sin ORACULO_PDF_HABILITADO=1 responde 503 y no hace nada.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Endpoint interno: nunca se indexa. La autenticación va ANTES del interruptor para no revelar su estado a extraños.
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader("Cache-Control", "no-store");

  const auth = String(req.headers.authorization || "");
  const esManual = req.method === "POST" && !!process.env.ORACULO_TOKEN && igualesSeguro(auth, `Bearer ${process.env.ORACULO_TOKEN}`);
  const esCron = req.method === "GET" && !!process.env.CRON_SECRET && igualesSeguro(auth, `Bearer ${process.env.CRON_SECRET}`);
  if (!esManual && !esCron) return res.status(401).json({ error: "no autorizado" });

  if (!oraculoHabilitado()) return res.status(503).json({ error: "generación del Oráculo desactivada" });

  const r = dependenciasReales();
  if ("faltan" in r) return res.status(503).json({ error: "faltan variables", faltan: r.faltan });

  if (esManual) {
    const id = typeof req.body?.session_id === "string" ? req.body.session_id : "";
    if (!/^cs_[A-Za-z0-9_]+$/.test(id)) return res.status(400).json({ error: "session_id inválido" });
    return res.status(200).json(await generarParaPedido(id, r.deps));
  }

  const n = Math.min(3, Math.max(1, Number(req.query.n) || 2)); // pocos por corrida: cada uno cuesta ~1,4 GB y segundos de CPU
  const lista = await r.deps.store.pendientes(n, new Date(Date.now() - MINUTOS_HUERFANO * 60_000).toISOString());
  const salida = [];
  for (const p of lista) salida.push({ sesion: p.stripe_session_id, ...(await generarParaPedido(p.stripe_session_id, r.deps)) });
  return res.status(200).json({ procesados: salida.length, salida });
}
