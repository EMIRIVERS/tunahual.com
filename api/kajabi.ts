import type { VercelRequest, VercelResponse } from "@vercel/node";

export interface KajabiInput {
  nombre: string;
  email: string;
  telefono?: string | null;
  /** Slug del nahual ya normalizado en el cliente (ej. "kat"). */
  nahualSlug?: string | null;
  tono?: number | string | null;
  fecha_nacimiento?: string | null;
}

export interface KajabiPayload {
  name: string;
  email: string;
  phone: string | null;
  tags: string[];
  custom_fields: Record<string, string>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_RE = /^[a-z]{1,12}$/;

/**
 * Arma el contacto para Kajabi: etiqueta "tunahual" + "nahual-<slug>" para
 * poder escribirles por nahual. Devuelve null si el correo no es válido.
 */
export function buildKajabiPayload(input: KajabiInput): KajabiPayload | null {
  const email = (input.email || "").trim().toLowerCase();
  const name = (input.nombre || "").trim();
  if (!name || !EMAIL_RE.test(email)) return null;

  const tags = ["tunahual"];
  const slug = (input.nahualSlug || "").trim().toLowerCase();
  if (SLUG_RE.test(slug)) tags.push(`nahual-${slug}`);

  const custom_fields: Record<string, string> = {};
  if (input.tono) custom_fields.tono = String(input.tono);
  if (input.fecha_nacimiento) custom_fields.fecha_nacimiento = input.fecha_nacimiento;

  return { name, email, phone: input.telefono?.trim() || null, tags, custom_fields };
}

/**
 * Envía el contacto al webhook de Kajabi (formulario de Kajabi, Make o Zapier
 * según lo que se configure en KAJABI_WEBHOOK_URL). NUNCA lanza: el lead ya
 * quedó guardado en Supabase; un fallo aquí no debe afectar al visitante.
 */
export async function sendToKajabi(
  input: KajabiInput,
  webhookUrl: string | undefined = process.env.KAJABI_WEBHOOK_URL,
  fetchImpl: typeof fetch = fetch,
  logger: Pick<Console, "error"> = console
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!webhookUrl) return { ok: false, reason: "KAJABI_WEBHOOK_URL no configurada" };

  const payload = buildKajabiPayload(input);
  if (!payload) return { ok: false, reason: "datos inválidos" };

  try {
    const response = await fetchImpl(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      logger.error(`[kajabi] respuesta ${response.status} email=${payload.email} body=${body}`);
      return { ok: false, reason: `kajabi ${response.status}` };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`[kajabi] excepción email=${payload.email} error=${message}`);
    return { ok: false, reason: message };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { nombre, email, telefono, nahualSlug, tono, fecha_nacimiento } = req.body ?? {};
  const result = await sendToKajabi({ nombre, email, telefono, nahualSlug, tono, fecha_nacimiento });
  // Siempre 200: igual que sync-lead, el visitante no debe ver el fallo.
  return res.status(200).json(result);
}
