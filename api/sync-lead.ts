import type { VercelRequest, VercelResponse } from "@vercel/node";

const AZULANAITEOS_URL = "https://ydkbwhwcwoxyuytlntoh.supabase.co";
const TRECENA_TU_NAHUAL = "2e76b980-8a74-4ff5-b1c6-c2840651d778";

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

  try {
    const response = await fetch(`${AZULANAITEOS_URL}/rest/v1/leads`, {
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
      const error = await response.text();
      // Ignorar duplicados (mismo teléfono en misma trecena)
      if (response.status === 409 || error.includes("unique")) {
        return res.status(200).json({ ok: true, duplicate: true });
      }
      console.error("AZULANAITEOS insert error:", error);
      return res.status(200).json({ ok: false, error });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("sync-lead error:", err);
    return res.status(200).json({ ok: false });
  }
}
