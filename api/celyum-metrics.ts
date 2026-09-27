import { createHash, timingSafeEqual } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export interface Metric {
  name: string;
  label: string;
  value: number;
  period: "now" | "24h" | "7d" | "30d" | "total";
}

export interface MetricsResponseBody {
  project: string;
  generated_at: string;
  status: "ok" | "degraded";
  metrics: Metric[];
  error_code?: "db_unreachable";
}

const PROJECT = "tu-nahual";
const DB_TIMEOUT_MS = 5000;

/**
 * Compara el token recibido contra el configurado en tiempo constante,
 * comparando el SHA-256 de ambos (nunca el texto plano) — ver contrato
 * celyum-metrics del 26-sep-2026.
 */
function tokenMatches(received: string, expected: string): boolean {
  const receivedHash = createHash("sha256").update(received).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(receivedHash, expectedHash);
}

/**
 * Cuenta filas en `leads` de la base del CRM "Azul Anaité OS", filtradas a
 * la trecena de Tu Nahual (misma credencial y patrón que api/sync-lead.ts),
 * sin traer ninguna fila: pide HEAD + `Prefer: count=exact` a PostgREST y
 * lee el total de `Content-Range`. Nunca lanza fuera de este módulo — el
 * caller decide qué hacer con el fallo.
 */
async function countLeads(
  crmUrl: string,
  serviceKey: string,
  trecenaId: string,
  extraFilter: string,
  fetchImpl: typeof fetch = fetch
): Promise<number> {
  const params = new URLSearchParams({
    trecena_id: `eq.${trecenaId}`,
    select: "id",
  });
  if (extraFilter) {
    const [key, value] = extraFilter.split("=");
    params.set(key, value);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DB_TIMEOUT_MS);
  try {
    const response = await fetchImpl(`${crmUrl}/rest/v1/leads?${params.toString()}`, {
      method: "HEAD",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: "count=exact",
      },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`PostgREST respondió ${response.status}`);
    }
    const contentRange = response.headers.get("content-range") || "";
    const total = Number(contentRange.split("/")[1]);
    if (!Number.isFinite(total)) {
      throw new Error(`Content-Range sin total: "${contentRange}"`);
    }
    return total;
  } finally {
    clearTimeout(timeout);
  }
}

export async function buildMetrics(
  crmUrl: string,
  serviceKey: string,
  trecenaId: string,
  fetchImpl: typeof fetch = fetch
): Promise<Metric[]> {
  const now = new Date();
  const isoSince = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString();

  const [total, last24h, last7d, last30d, pendientes, interesados, convertidos] = await Promise.all([
    countLeads(crmUrl, serviceKey, trecenaId, "", fetchImpl),
    countLeads(crmUrl, serviceKey, trecenaId, `created_at=gte.${isoSince(24)}`, fetchImpl),
    countLeads(crmUrl, serviceKey, trecenaId, `created_at=gte.${isoSince(24 * 7)}`, fetchImpl),
    countLeads(crmUrl, serviceKey, trecenaId, `created_at=gte.${isoSince(24 * 30)}`, fetchImpl),
    countLeads(crmUrl, serviceKey, trecenaId, "status=eq.PENDIENTE", fetchImpl),
    countLeads(crmUrl, serviceKey, trecenaId, "status=eq.INTERESADO", fetchImpl),
    countLeads(crmUrl, serviceKey, trecenaId, "status=eq.CONVERTIDO", fetchImpl),
  ]);

  return [
    { name: "leads_24h", label: "Leads en 24 horas", value: last24h, period: "24h" },
    { name: "leads_7d", label: "Leads en 7 días", value: last7d, period: "7d" },
    { name: "leads_30d", label: "Leads en 30 días", value: last30d, period: "30d" },
    { name: "leads_total", label: "Leads totales", value: total, period: "total" },
    { name: "leads_pendientes", label: "Leads pendientes de contactar", value: pendientes, period: "now" },
    { name: "leads_interesados", label: "Leads interesados", value: interesados, period: "now" },
    { name: "leads_convertidos", label: "Leads convertidos", value: convertidos, period: "total" },
  ];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const expectedToken = process.env.CELYUM_METRICS_TOKEN;
  if (!expectedToken) {
    return res.status(503).json({ error: "not_configured" });
  }

  const authHeader = String(req.headers.authorization || "");
  const [scheme, receivedToken] = authHeader.split(" ");
  if (scheme !== "Bearer" || !receivedToken || !tokenMatches(receivedToken, expectedToken)) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const body: MetricsResponseBody = {
    project: PROJECT,
    generated_at: new Date().toISOString(),
    status: "ok",
    metrics: [],
  };

  // Credencial de servidor que el sitio ya tiene (api/sync-lead.ts): la
  // base propia de Tu Nahual (yzijamjsnaardrnqdycl) no admite lectura desde
  // aquí (solo la `anon key`, y RLS le niega SELECT sobre `leads`), así que
  // las métricas de negocio salen del CRM "Azul Anaité OS" donde sync-lead.ts
  // ya sincroniza cada lead, filtradas a la trecena de Tu Nahual — nunca se
  // crea ninguna llave nueva.
  const crmUrl = process.env.AZULANAITEOS_URL;
  const serviceKey = process.env.AZULANAITEOS_SERVICE_KEY;
  const trecenaId = process.env.AZULANAITEOS_TRECENA_ID;

  if (!crmUrl || !serviceKey || !trecenaId) {
    body.status = "degraded";
    body.error_code = "db_unreachable";
    return res.status(200).json(body);
  }

  try {
    body.metrics = await buildMetrics(crmUrl, serviceKey, trecenaId);
  } catch {
    // Nunca el mensaje interno del error (contrato celyum-metrics).
    body.status = "degraded";
    body.metrics = [];
    body.error_code = "db_unreachable";
  }

  return res.status(200).json(body);
}
