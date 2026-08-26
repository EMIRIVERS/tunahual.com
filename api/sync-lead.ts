import type { VercelRequest, VercelResponse } from "@vercel/node";

const AZULANAITEOS_URL = "https://ydkbwhwcwoxyuytlntoh.supabase.co";
const TRECENA_TU_NAHUAL = "2e76b980-8a74-4ff5-b1c6-c2840651d778";

export interface SyncLeadInput {
  nombre: string;
  email?: string | null;
  telefono: string;
  nahual?: string | null;
  tono?: number | string | null;
  kin_completo?: string | null;
  fecha_nacimiento?: string | null;
}

export type SyncLeadResult =
  | { synced: true; duplicate?: boolean }
  | { synced: false; crmError: string };

/**
 * Sincroniza un lead (ya guardado en Supabase por el llamador) al CRM
 * "Azul Anaité OS". NUNCA lanza: un fallo del CRM no debe tumbar la
 * experiencia del visitante, que ya tiene su dato guardado. En vez de
 * eso, deja constancia con detalle suficiente para reprocesar (logger)
 * y regresa `synced: false` para que el llamador sepa que quedó
 * pendiente de sincronizar.
 */
export async function syncLeadToCrm(
  lead: SyncLeadInput,
  serviceKey: string,
  fetchImpl: typeof fetch = fetch,
  logger: Pick<Console, "error"> = console
): Promise<SyncLeadResult> {
  const { nombre, email, telefono, nahual, tono, kin_completo, fecha_nacimiento } = lead;

  const notes = [
    nahual ? `Nahual: ${nahual}` : null,
    tono ? `Tono: ${tono}` : null,
    kin_completo ? `Kin: ${kin_completo}` : null,
    fecha_nacimiento ? `Fecha nac: ${fecha_nacimiento}` : null,
    `Fuente: Calculadora Maya tunahual.vercel.app`,
  ]
    .filter(Boolean)
    .join(" | ");

  const payload = {
    name: nombre,
    phone: telefono,
    email: email || null,
    status: "PENDIENTE",
    source: "web_form",
    trecena_id: TRECENA_TU_NAHUAL,
    notes,
  };

  // Identificador reprocesable: no tenemos el id de Supabase aquí (este
  // endpoint solo sincroniza, no inserta), así que dejamos los datos que
  // permiten reintentar el alta manual en el CRM.
  const leadRef = `email=${email || "-"} telefono=${telefono} fecha_nacimiento=${fecha_nacimiento || "-"}`;

  try {
    const response = await fetchImpl(`${AZULANAITEOS_URL}/rest/v1/leads`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      // Ignorar duplicados (mismo teléfono en misma trecena): no es un
      // fallo de sync, el lead ya existe en el CRM.
      if (response.status === 409 || errorBody.includes("unique")) {
        return { synced: true, duplicate: true };
      }
      logger.error(
        `[sync-lead] fallo al sincronizar con CRM — pendiente de reprocesar. lead=(${leadRef}) status=${response.status} body=${errorBody}`
      );
      return { synced: false, crmError: errorBody };
    }

    return { synced: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(
      `[sync-lead] excepción al sincronizar con CRM — pendiente de reprocesar. lead=(${leadRef}) error=${message}`
    );
    return { synced: false, crmError: message };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const serviceKey = process.env.AZULANAITEOS_SERVICE_KEY;
  if (!serviceKey) {
    return res.status(500).json({ error: "Service key not configured" });
  }

  const { nombre, email, telefono, nahual, tono, kin_completo, fecha_nacimiento } = req.body;

  if (!nombre || !telefono) {
    return res.status(400).json({ error: "nombre y telefono son requeridos" });
  }

  const result = await syncLeadToCrm(
    { nombre, email, telefono, nahual, tono, kin_completo, fecha_nacimiento },
    serviceKey
  );

  // Siempre 200: el lead del visitante ya quedó guardado en Supabase antes
  // de llegar aquí (ver src/pages/Index.tsx). Un fallo del CRM no debe
  // convertirse en un error visible para el visitante, pero tampoco debe
  // desaparecer: queda en el log (arriba) y en este campo `synced` para
  // quien inspeccione la respuesta o quiera reprocesar.
  return res.status(200).json(result);
}
