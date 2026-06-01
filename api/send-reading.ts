import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { nombre, email, nahual, tono, significado, descripcion, kin_completo } = req.body;

  if (!nombre || !email) {
    return res.status(400).json({ error: "nombre y email son requeridos" });
  }

  // Degradación elegante: sin API key, no rompe el flujo.
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ ok: false, skipped: true });
  }

  const emailFrom = process.env.EMAIL_FROM || "Tu Nahual <tu-nahual@tunahual.com>";

  try {
    const htmlContent = generateEmailHTML({
      nombre,
      nahual: nahual || "Tu Nahual",
      tono: String(tono ?? ""),
      significado: significado || "",
      descripcion: descripcion || "",
      kinCompleto: kin_completo || "",
    });

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: emailFrom,
        to: email,
        subject: `Tu lectura maya: ${tono} ${nahual}`,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Resend API error:", error);
      return res.status(200).json({ ok: false });
    }

    const data = await response.json();
    return res.status(200).json({ ok: true, id: data.id });
  } catch (err) {
    console.error("send-reading error:", err);
    return res.status(200).json({ ok: false });
  }
}

/**
 * Escapa HTML — seguro en Node (sin DOM).
 */
function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Email editorial sobrio en paleta bronce/oro + crema, serif para titulares.
 */
function generateEmailHTML(data: {
  nombre: string;
  nahual: string;
  tono: string;
  significado: string;
  descripcion: string;
  kinCompleto: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu lectura maya</title>
</head>
<body style="margin:0;padding:0;background-color:#faf8f3;color:#3d3d3d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',sans-serif;line-height:1.6;">
  <div style="max-width:600px;margin:0 auto;background-color:#fff9f3;border:1px solid #e8dcc8;">
    <div style="background:linear-gradient(135deg,#a3732b 0%,#d4a574 100%);padding:44px 30px;text-align:center;color:#fff9f3;">
      <p style="font-size:13px;letter-spacing:4px;text-transform:uppercase;opacity:0.95;margin:0 0 8px;">Cholq'ij</p>
      <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:normal;margin:0;">Tu lectura maya</h1>
    </div>

    <div style="padding:40px 30px;">
      <p style="font-size:16px;margin:0 0 28px;">Hola <strong style="color:#a3732b;">${escapeHtml(data.nombre)}</strong>,</p>

      <div style="background-color:#fef5ed;border-left:4px solid #a3732b;padding:22px;margin:0 0 30px;border-radius:4px;">
        <h2 style="font-family:Georgia,serif;font-size:26px;color:#a3732b;margin:0;font-weight:normal;">${escapeHtml(data.tono)} ${escapeHtml(data.nahual)}</h2>
        ${data.kinCompleto ? `<p style="margin:10px 0 0;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;color:#7a5a23;">${escapeHtml(data.kinCompleto)}</p>` : ""}
      </div>

      ${data.significado ? `
      <div style="margin:0 0 28px;">
        <h3 style="font-family:Georgia,serif;font-size:18px;color:#a3732b;font-weight:normal;border-bottom:1px solid #e8dcc8;padding-bottom:8px;margin:0 0 12px;">Significado</h3>
        <p style="font-size:15px;line-height:1.7;margin:0;">${escapeHtml(data.significado)}</p>
      </div>` : ""}

      ${data.descripcion ? `
      <div style="margin:0 0 28px;">
        <h3 style="font-family:Georgia,serif;font-size:18px;color:#a3732b;font-weight:normal;border-bottom:1px solid #e8dcc8;padding-bottom:8px;margin:0 0 12px;">Tu lectura</h3>
        <p style="font-size:15px;line-height:1.7;margin:0;">${escapeHtml(data.descripcion)}</p>
      </div>` : ""}

      <div style="height:1px;background-color:#e8dcc8;margin:36px 0;"></div>

      <p style="text-align:center;font-style:italic;color:#7a5a23;font-size:15px;margin:0;">
        Que esta lectura ilumine tu camino. Tu Nahual guía tus pasos en el Cholq'ij sagrado.
      </p>
    </div>

    <div style="background-color:#fef5ed;padding:30px;text-align:center;border-top:1px solid #e8dcc8;">
      <p style="font-size:14px;color:#7a5a23;margin:0 0 16px;">Continúa tu camino con la tradición maya k'iche'.</p>
      <a href="https://azulanaite.com" style="display:inline-block;background-color:#a3732b;color:#fff9f3;padding:12px 26px;text-decoration:none;border-radius:999px;font-size:14px;font-weight:600;letter-spacing:0.5px;">Conoce Azul Anaité</a>
      <p style="margin:20px 0 0;font-size:12px;color:#b8a98f;">tunahual.com · Azul Anaité</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
