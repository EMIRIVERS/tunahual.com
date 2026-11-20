/**
 * Preflight del cobro del Mapa / Oráculo: ¿está tunahual.com listo para abrir ventas?
 * Solo LEE (GET a Stripe y Supabase, lectura de nombres de variables en Vercel). No
 * cobra, no crea sesiones, no escribe en la base ni sube nada. Las llaves salen del
 * Keychain de macOS; nunca se imprimen.
 *
 *   bun run preflight:cobro               revisión completa
 *   bun run preflight:cobro -- --correo   además envía UN correo de prueba a emiriversccc@gmail.com
 *
 * Estados:  PASS = listo · FAIL = hay que arreglarlo antes de vender · PENDIENTE = decisión
 * de una persona (Azul o Emi) · INFO = dato sin veredicto. Sale con código 1 si hay algún FAIL.
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- el script lee JSON de APIs externas sin esquema */
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

type Estado = "PASS" | "FAIL" | "PENDIENTE" | "INFO";
interface Fila {
  area: string;
  revision: string;
  estado: Estado;
  detalle: string;
}

const SCOPE = "emi-rivers-projects";
const REF = "kthmoffuateddameqafx";
const SITIO = "https://www.tunahual.com";
const CORREO_PRUEBA = "emiriversccc@gmail.com";
const filas: Fila[] = [];
const anotar = (area: string, revision: string, estado: Estado, detalle: string) => filas.push({ area, revision, estado, detalle });

function keychain(servicio: string): string | null {
  try {
    return execFileSync("security", ["find-generic-password", "-s", servicio, "-w"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() || null;
  } catch {
    return null;
  }
}

async function json(url: string, init?: RequestInit): Promise<{ status: number; body: any }> {
  try {
    const r = await fetch(url, { ...init, signal: AbortSignal.timeout(20_000) });
    const texto = await r.text();
    try {
      return { status: r.status, body: JSON.parse(texto) };
    } catch {
      return { status: r.status, body: texto };
    }
  } catch (e) {
    return { status: 0, body: String(e) };
  }
}

/* ───────────── 1. Variables de Vercel Production (solo nombres) ───────────── */

function nombresEnProduccion(): Set<string> | null {
  try {
    const salida = execFileSync("vercel", ["env", "ls", "production", "--scope", SCOPE], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    return new Set([...salida.matchAll(/^\s+([A-Z][A-Z0-9_]+)\s+Encrypted/gm)].map((m) => m[1]));
  } catch {
    return null;
  }
}

const vars = nombresEnProduccion();
if (!vars) {
  anotar("Vercel", "variables de Production", "FAIL", "no se pudo correr `vercel env ls production` (¿sesión de la CLI?)");
} else {
  const requeridas: [string, string][] = [
    ["VITE_SUPABASE_URL", "se hornea en el build"],
    ["VITE_SUPABASE_PUBLISHABLE_KEY", "se hornea en el build"],
    ["VITE_SUPABASE_PROJECT_ID", "se hornea en el build"],
    ["SUPABASE_SERVICE_ROLE_KEY", "webhook y generación escriben en pedidos"],
    ["STRIPE_SECRET_KEY", "crea la Checkout Session"],
    ["STRIPE_PRICE_ID", "precio del producto"],
    ["STRIPE_WEBHOOK_SECRET", "firma del webhook"],
    ["RESEND_API_KEY", "correo de entrega"],
    ["ORACULO_TOKEN", "el webhook llama a generar-oraculo"],
    ["CRON_SECRET", "autoriza el cron de reintentos"],
  ];
  for (const [v, para] of requeridas) anotar("Vercel", v, vars.has(v) ? "PASS" : "FAIL", vars.has(v) ? `definida (${para})` : `FALTA (${para})`);
  anotar("Vercel", "EMAIL_FROM", vars.has("EMAIL_FROM") ? "PASS" : "PENDIENTE", vars.has("EMAIL_FROM") ? "definida" : "no definida: se usa «Tu Nahual <tu-nahual@tunahual.com>» (Emi: confirmar remitente al verificar el dominio en Resend)");
  anotar("Vercel", "KAJABI_WEBHOOK_URL", vars.has("KAJABI_WEBHOOK_URL") ? "PASS" : "PENDIENTE", vars.has("KAJABI_WEBHOOK_URL") ? "definida" : "FALTA: sin ella no se etiqueta a las compradoras en Kajabi (Emi la crea en Kajabi)");
  anotar("Vercel", "MAPA_PDF_BASE_URL", vars.has("MAPA_PDF_BASE_URL") ? "INFO" : "PASS", vars.has("MAPA_PDF_BASE_URL") ? "definida: solo la usa el Mapa viejo (ORACULO_PDF_HABILITADO apagado)" : "no necesaria: con la generación del Oráculo activa no se usan PDFs pregenerados");
  for (const v of ["ORACULO_PERMITIR_BORRADOR", "ORACULO_SIN_CORREO"]) {
    anotar("Vercel", v, vars.has(v) ? "FAIL" : "PASS", vars.has(v) ? "NO debe existir en Production (entregaría borradores / sin correo)" : "ausente, como debe ser");
  }
}

/* ───────────── 2. Stripe (GET con la restricted key) ───────────── */

const rk = keychain("stripe-tunahual-rk-live");
const priceId = keychain("stripe-tunahual-price-id");
if (!rk || !priceId) {
  anotar("Stripe", "llaves en Keychain", "FAIL", "falta stripe-tunahual-rk-live o stripe-tunahual-price-id");
} else {
  const auth = { Authorization: `Basic ${Buffer.from(`${rk}:`).toString("base64")}` };
  const precio = await json(`https://api.stripe.com/v1/prices/${priceId}`, { headers: auth });
  if (precio.status !== 200) {
    anotar("Stripe", "precio", "FAIL", `GET price → ${precio.status} ${precio.body?.error?.message ?? ""}`);
  } else {
    const p = precio.body;
    const ok = p.active && p.currency === "usd" && p.unit_amount === 1100 && p.type === "one_time" && p.livemode;
    anotar("Stripe", "precio", ok ? "PASS" : "FAIL", `${p.id}: ${(p.unit_amount ?? 0) / 100} ${String(p.currency).toUpperCase()}, ${p.type}, ${p.active ? "activo" : "INACTIVO"}, ${p.livemode ? "live" : "test"}`);
    anotar("Stripe", "precio vs decisión", "PENDIENTE", "11 USD por ahora; Emi/Azul confirman el precio definitivo del Oráculo (docs/oraculo-asincrono.md, «Decisiones abiertas»)");
    const prod = await json(`https://api.stripe.com/v1/products/${p.product}`, { headers: auth });
    const meta = prod.body?.metadata?.producto;
    anotar("Stripe", "producto", prod.status === 200 && prod.body.active && meta === "mapa-energia" ? "PASS" : "FAIL", prod.status === 200 ? `«${prod.body.name}», metadata.producto=${meta ?? "(vacío)"}` : `GET product → ${prod.status}`);
  }
  const hooks = await json("https://api.stripe.com/v1/webhook_endpoints?limit=100", { headers: auth });
  if (hooks.status !== 200) {
    anotar("Stripe", "webhook", "FAIL", `GET webhook_endpoints → ${hooks.status}`);
  } else {
    const h = (hooks.body.data as any[]).find((x) => x.url === `${SITIO}/api/stripe-webhook`);
    const ok = h && h.status === "enabled" && h.enabled_events.includes("checkout.session.completed");
    anotar("Stripe", "webhook", ok ? "PASS" : "FAIL", h ? `${h.id} ${h.status}, eventos: ${h.enabled_events.join(", ")}` : `no hay endpoint hacia ${SITIO}/api/stripe-webhook`);
  }
}

/* ───────────── 3. Supabase: migraciones, RLS, bucket ───────────── */

const pat = keychain("supabase-tunahual-pat");
const sql = async (q: string) =>
  json(`https://api.supabase.com/v1/projects/${REF}/database/query`, { method: "POST", headers: { Authorization: `Bearer ${pat}`, "Content-Type": "application/json" }, body: JSON.stringify({ query: q }) });
if (!pat) {
  anotar("Supabase", "PAT", "FAIL", "falta supabase-tunahual-pat en Keychain");
} else {
  const mig = await sql("select version from supabase_migrations.schema_migrations where version in ('20261004000000','20261005000000','20261006000000')");
  const aplicadas = Array.isArray(mig.body) ? mig.body.map((r: any) => r.version) : [];
  const faltan = ["20261004000000", "20261005000000", "20261006000000"].filter((v) => !aplicadas.includes(v));
  anotar("Supabase", "migraciones 20261004/05/06", mig.status === 201 || mig.status === 200 ? (faltan.length ? "FAIL" : "PASS") : "FAIL", faltan.length ? `sin registrar: ${faltan.join(", ")}` : "las tres registradas en schema_migrations");

  const rls = await sql("select rowsecurity from pg_tables where schemaname='public' and tablename='pedidos'");
  const pol = await sql("select count(*)::int as n from pg_policies where schemaname='public' and tablename='pedidos'");
  const gr = await sql("select count(*)::int as n from information_schema.role_table_grants where table_schema='public' and table_name='pedidos' and grantee in ('anon','authenticated')");
  const rlsOn = rls.body?.[0]?.rowsecurity === true;
  const nPol = pol.body?.[0]?.n;
  const nGr = gr.body?.[0]?.n;
  anotar("Supabase", "RLS de pedidos", rlsOn && nPol === 0 && nGr === 0 ? "PASS" : "FAIL", `RLS ${rlsOn ? "activa" : "APAGADA"}, ${nPol} políticas, ${nGr} permisos para anon/authenticated (solo la service role entra)`);

  const sk = keychain("supabase-tunahual-service-role");
  const bucket = sk ? await json(`https://${REF}.supabase.co/storage/v1/bucket/oraculos`, { headers: { Authorization: `Bearer ${sk}`, apikey: sk } }) : { status: 0, body: "sin service role en Keychain" };
  if (bucket.status !== 200) {
    anotar("Supabase", "bucket oraculos", "FAIL", `GET bucket → ${bucket.status}`);
  } else {
    const b = bucket.body;
    const ok = b.public === false && b.file_size_limit === 10485760 && JSON.stringify(b.allowed_mime_types) === JSON.stringify(["application/pdf"]);
    anotar("Supabase", "bucket oraculos", ok ? "PASS" : "FAIL", `public=${b.public}, límite ${b.file_size_limit} B, mime ${JSON.stringify(b.allowed_mime_types)}`);
  }
}

/* ───────────── 4. Contenido del Oráculo: aprobación de Azul ───────────── */

function archivosMd(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const ruta = join(dir, n);
    return statSync(ruta).isDirectory() ? archivosMd(ruta) : n.endsWith(".md") && n !== "ESQUEMA.md" ? [ruta] : [];
  });
}
const conteo: Record<string, number> = {};
const archivos = archivosMd(join(process.cwd(), "content/oraculo"));
for (const f of archivos) {
  const m = /^---\n([\s\S]*?)\n---/.exec(readFileSync(f, "utf8"));
  const rev = m && /^revision:\s*(\S+)/m.exec(m[1])?.[1];
  const clave = rev ?? "sin-revision";
  conteo[clave] = (conteo[clave] ?? 0) + 1;
}
const aprobados = conteo["aprobada"] ?? 0;
const sinAprobar = archivos.length - aprobados;
anotar("Contenido", "revisión de Azul", sinAprobar === 0 ? "PASS" : "PENDIENTE", `${aprobados} aprobados / ${sinAprobar} pendientes de ${archivos.length} archivos (${Object.entries(conteo).map(([k, v]) => `${k}: ${v}`).join(", ")})`);

/* ───────────── 5. Resend ───────────── */

const resend = keychain("resend-tunahual-api-key");
if (!resend) {
  anotar("Resend", "llave", "FAIL", "falta resend-tunahual-api-key en Keychain");
} else {
  const dominios = await json("https://api.resend.com/domains", { headers: { Authorization: `Bearer ${resend}` } });
  if (dominios.status === 200) {
    const d = (dominios.body.data as any[]).find((x) => x.name === "tunahual.com");
    anotar("Resend", "dominio tunahual.com", d?.status === "verified" ? "PASS" : "FAIL", d ? `estado ${d.status}` : "dominio no dado de alta en Resend");
  } else if (process.argv.includes("--correo")) {
    const envio = await json("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resend}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Tu Nahual <tu-nahual@tunahual.com>", to: CORREO_PRUEBA, subject: "Preflight tunahual.com: prueba de envío", html: "<p>Prueba técnica del preflight de cobro. No requiere acción.</p>" }),
    });
    anotar("Resend", "envío de prueba", envio.status === 200 ? "PASS" : "FAIL", envio.status === 200 ? `enviado a ${CORREO_PRUEBA} (id ${envio.body.id})` : `${envio.status}: ${envio.body?.message ?? envio.body} (Emi: verificar tunahual.com en resend.com/domains, con DNS)`);
  } else {
    anotar("Resend", "dominio tunahual.com", "PENDIENTE", "la llave es send-only y no lista dominios; corre con --correo para probar un envío real");
  }
}

/* ───────────── 6. Estado real en vivo (sondas que no cobran ni escriben) ───────────── */

const checkout = await json(`${SITIO}/api/create-checkout`, { method: "POST", headers: { "Content-Type": "application/json", Origin: SITIO }, body: "{}" });
const checkoutAbierto = checkout.status !== 503 && checkout.status !== 0; // cuerpo vacío: abierto → 400 de validación, nunca crea sesión
anotar("En vivo", "create-checkout", "INFO", checkout.status === 503 ? "503: CHECKOUT_HABILITADO apagado (cerrado)" : `${checkout.status}: ABIERTO (CHECKOUT_HABILITADO=1)`);
const hook = await json(`${SITIO}/api/stripe-webhook`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
anotar("En vivo", "stripe-webhook sin firma", hook.status === 400 ? "PASS" : "FAIL", `${hook.status} (esperado 400)`);
const sinToken = await json(`${SITIO}/api/generar-oraculo`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
anotar("En vivo", "generar-oraculo sin token", sinToken.status === 401 ? "PASS" : "FAIL", `${sinToken.status} (esperado 401)`);
const tok = keychain("oraculo-tunahual-token");
let oraculoActivo = false;
if (tok) {
  const conToken = await json(`${SITIO}/api/generar-oraculo`, { method: "POST", headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" }, body: JSON.stringify({ session_id: "cs_preflight_inexistente" }) });
  oraculoActivo = conToken.status === 200; // 200 = «pedido inexistente»; 503 = interruptor apagado
  anotar("En vivo", "generar-oraculo con token", "INFO", conToken.status === 503 ? "503: ORACULO_PDF_HABILITADO apagado (la función existe y el token vale)" : conToken.status === 200 ? `200 ${JSON.stringify(conToken.body)}: ACTIVA` : `${conToken.status}: ${JSON.stringify(conToken.body)}`);
} else {
  anotar("En vivo", "generar-oraculo con token", "FAIL", "falta oraculo-tunahual-token en Keychain");
}
const vistaVite = vars?.has("VITE_CHECKOUT_MAPA") ?? false;
anotar("En vivo", "VITE_CHECKOUT_MAPA", "INFO", vistaVite ? "definida en Vercel (el botón aparece solo tras un redeploy: se hornea en el build)" : "no definida: sin botón de compra");

/* ───────────── 7. Interruptores y combinaciones ───────────── */

const sinAprobarCont = sinAprobar > 0;
const resendOk = filas.some((f) => f.area === "Resend" && f.estado === "PASS");
filas.push({
  area: "Interruptores",
  revision: "estado actual",
  estado: "INFO",
  detalle: `CHECKOUT_HABILITADO=${checkoutAbierto ? "1" : "—"} · VITE_CHECKOUT_MAPA=${vistaVite ? "1" : "—"} · ORACULO_PDF_HABILITADO=${oraculoActivo ? "1" : "—"}`,
});
if (checkoutAbierto && (sinAprobarCont || !resendOk || !oraculoActivo)) {
  anotar("Interruptores", "RIESGO de cobrar sin entregar", "FAIL", `el cobro está ABIERTO pero ${[sinAprobarCont && "el contenido no está aprobado", !resendOk && "el correo no está verificado", !oraculoActivo && "la generación está apagada"].filter(Boolean).join(", ")}: quien pague no recibiría su Oráculo`);
} else {
  anotar("Interruptores", "orden de apertura", "PASS", checkoutAbierto ? "el cobro está abierto y todo lo que entrega está listo" : "el cobro sigue cerrado (503): sin riesgo de cobrar sin entregar");
}

const combos: [string, string, string, string][] = [
  ["0", "0", "0", "CERRADO. Estado de hoy. Nadie puede comprar ni ve el botón."],
  ["0", "1", "*", "MALO: el botón aparece y al pulsarlo create-checkout responde 503 («aún no está disponible»). Nunca encender el botón antes que el cobro."],
  ["1", "0", "*", "API abierta sin botón: nadie la ve, pero quien llame a create-checkout con curl y origen válido sí compra. Solo para la compra de prueba."],
  ["1", "1", "0", "PELIGRO: se cobra y la entrega cae al Mapa viejo (necesita MAPA_PDF_BASE_URL y 260 PDFs); el Oráculo no se genera."],
  ["1", "1", "1", "ABIERTO. Compra → webhook → generar-oraculo → PDF en Storage → correo. Exige contenido aprobado, Resend verificado y KAJABI_WEBHOOK_URL."],
];
console.log("\nCombinaciones de interruptores (CHECKOUT_HABILITADO / VITE_CHECKOUT_MAPA / ORACULO_PDF_HABILITADO):");
for (const [a, b, c, txt] of combos) console.log(`  ${a} / ${b} / ${c}   ${txt}`);
console.log("  Con ORACULO_PDF_HABILITADO=1 y contenido sin aprobar, la función se NIEGA a entregar: el pedido queda «fallido» y quien pagó no recibe nada. Por eso Azul aprueba ANTES.\n");

/* ───────────── Salida ───────────── */

const marca: Record<Estado, string> = { PASS: "PASS      ", FAIL: "FAIL      ", PENDIENTE: "PENDIENTE ", INFO: "INFO      " };
const w = Math.max(...filas.map((f) => f.area.length));
const w2 = Math.max(...filas.map((f) => f.revision.length));
console.log("PREFLIGHT DE COBRO · tunahual.com");
for (const f of filas) console.log(`${marca[f.estado]} ${f.area.padEnd(w)}  ${f.revision.padEnd(w2)}  ${f.detalle}`);
const n = (e: Estado) => filas.filter((f) => f.estado === e).length;
console.log(`\nResumen: ${n("PASS")} PASS · ${n("FAIL")} FAIL · ${n("PENDIENTE")} PENDIENTE · ${n("INFO")} INFO`);
if (n("FAIL")) console.log("NO abrir ventas: hay FAIL.");
else if (n("PENDIENTE")) console.log("Sin fallos técnicos. Quedan PENDIENTES que dependen de personas (ver docs/activar-ventas.md).");
else console.log("Todo en verde.");
process.exit(n("FAIL") ? 1 : 0);
