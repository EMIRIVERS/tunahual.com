import { nahualGlifos } from "@/data/nahualGlifos";
import logo from "@/assets/logo-azul-anaite.png";

/**
 * Tarjeta 9:16 lista para historia de Instagram: glifo, "Soy 7 Aq'ab'al",
 * logo de Azul Anaité y tunahual.com. Se dibuja en un canvas del navegador.
 */

export const TARJETA_ANCHO = 1080;
export const TARJETA_ALTO = 1920;

const BRONCE = "#a3732b";
const CREMA_ARRIBA = "#f8f1e1";
const CREMA_ABAJO = "#eadcc0";
const TINTA = "#2a1d12";

function cargarImagen(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Parte un texto en líneas que quepan en `maxAncho` con la fuente ya fijada. */
function partirLineas(ctx: CanvasRenderingContext2D, texto: string, maxAncho: number): string[] {
  const lineas: string[] = [];
  let actual = "";
  for (const palabra of texto.split(/\s+/)) {
    const prueba = actual ? `${actual} ${palabra}` : palabra;
    if (ctx.measureText(prueba).width > maxAncho && actual) {
      lineas.push(actual);
      actual = palabra;
    } else {
      actual = prueba;
    }
  }
  if (actual) lineas.push(actual);
  return lineas;
}

export interface DatosTarjeta {
  nahual: string;
  tono: number;
  significado?: string | null;
}

export async function generarTarjetaHistoria(datos: DatosTarjeta): Promise<Blob> {
  if (document.fonts?.ready) await document.fonts.ready;

  const canvas = document.createElement("canvas");
  canvas.width = TARJETA_ANCHO;
  canvas.height = TARJETA_ALTO;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible");

  // Fondo
  const fondo = ctx.createLinearGradient(0, 0, 0, TARJETA_ALTO);
  fondo.addColorStop(0, CREMA_ARRIBA);
  fondo.addColorStop(1, CREMA_ABAJO);
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, TARJETA_ANCHO, TARJETA_ALTO);

  // Marco
  ctx.strokeStyle = BRONCE;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 4;
  ctx.strokeRect(48, 48, TARJETA_ANCHO - 96, TARJETA_ALTO - 96);
  ctx.globalAlpha = 1;

  const cx = TARJETA_ANCHO / 2;
  const serif = '"Cormorant Garamond", Georgia, "Times New Roman", serif';
  ctx.textAlign = "center";

  // Etiqueta
  ctx.fillStyle = BRONCE;
  ctx.font = `600 34px ${serif}`;
  ctx.letterSpacing = "10px";
  ctx.fillText("TU NAHUAL", cx, 190);
  ctx.letterSpacing = "0px";

  // Glifo en círculo
  const [glifo, logoImg] = await Promise.all([
    cargarImagen(nahualGlifos[datos.nahual] ?? ""),
    cargarImagen(logo),
  ]);
  const radio = 300;
  const cy = 700;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radio, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.clip();
  if (glifo) {
    const lado = radio * 2 - 40;
    ctx.drawImage(glifo, cx - lado / 2, cy - lado / 2, lado, lado);
  }
  ctx.restore();
  ctx.beginPath();
  ctx.arc(cx, cy, radio, 0, Math.PI * 2);
  ctx.strokeStyle = BRONCE;
  ctx.lineWidth = 6;
  ctx.stroke();

  // "Soy 7 Aq'ab'al"
  ctx.fillStyle = TINTA;
  ctx.font = `500 54px ${serif}`;
  ctx.fillText("Soy", cx, 1160);
  ctx.font = `600 150px ${serif}`;
  ctx.fillText(`${datos.tono} ${datos.nahual}`, cx, 1310);

  // Significado
  if (datos.significado) {
    ctx.fillStyle = BRONCE;
    ctx.font = `italic 500 46px ${serif}`;
    partirLineas(ctx, datos.significado, TARJETA_ANCHO - 260).slice(0, 2).forEach((l, i) => {
      ctx.fillText(l, cx, 1410 + i * 60);
    });
  }

  // Logo y dirección
  if (logoImg) {
    const ancho = 360;
    const alto = (logoImg.height / logoImg.width) * ancho;
    ctx.drawImage(logoImg, cx - ancho / 2, 1550, ancho, alto);
  }
  ctx.fillStyle = TINTA;
  ctx.font = `600 44px ${serif}`;
  ctx.fillText("Descubre el tuyo en tunahual.com", cx, 1800);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo crear la imagen"))), "image/png")
  );
}
