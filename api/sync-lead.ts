import type { VercelRequest, VercelResponse } from "@vercel/node";

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
 *
 * `crmUrl` y `trecenaId` vienen de entorno (`AZULANAITEOS_URL` y
 * `AZULANAITEOS_TRECENA_ID`), nunca hardcodeados: un ref o UUID fijo aquí
 * fue lo que hizo que el sync apuntara al proyecto Supabase muerto sin que
 * nadie lo notara (ver ORD-2026-08-26-047).
 */
export async function syncLeadToCrm(
  lead: SyncLeadInput,
  serviceKey: string,
  fetchImpl: typeof fetch = fetch,
  logger: Pick<Console, "error"> = console,
  crmUrl: string | undefined = process.env.AZULANAITEOS_URL,
  trecenaId: string | undefined = process.env.AZULANAITEOS_TRECENA_ID
): Promise<SyncLeadResult> {
  const { nombre, email, telefono, nahual, tono, kin_completo, fecha_nacimiento } = lead;

  // Identificador reprocesable: no tenemos el id de Supabase aquí (este
  // endpoint solo sincroniza, no inserta), así que dejamos los datos que
  // permiten reintentar el alta manual en el CRM.
  const leadRef = `email=${email || "-"} telefono=${telefono} fecha_nacimiento=${fecha_nacimiento || "-"}`;

  if (!crmUrl || !trecenaId) {
    const message = "AZULANAITEOS_URL o AZULANAITEOS_TRECENA_ID no configuradas en el entorno";
    logger.error(`[sync-lead] ${message} — lead=(${leadRef}) queda pendiente de reprocesar`);
    return { synced: false, crmError: message };
  }

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
    trecena_id: trecenaId,
    notes,
  };

  try {
    const response = await fetchImpl(`${crmUrl}/rest/v1/leads`, {
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
  if (!serviceKey || !process.env.AZULANAITEOS_URL || !process.env.AZULANAITEOS_TRECENA_ID) {
    return res.status(500).json({ error: "CRM sync not configured" });
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
