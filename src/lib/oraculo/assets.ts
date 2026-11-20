import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

/** Carpeta assets/oraculo del repo (fuentes OFL, glifos recoloreados, logo). */
const RAIZ_ASSETS = fileURLToPath(new URL("../../../assets/oraculo/", import.meta.url));

const cache = new Map<string, string>();

/** Archivo de assets/oraculo como data URI (el HTML viaja autocontenido a Chromium). */
export function dataUri(rutaRelativa: string, mime: string): string {
  const hit = cache.get(rutaRelativa);
  if (hit) return hit;
  const b64 = readFileSync(join(RAIZ_ASSETS, rutaRelativa)).toString("base64");
  const uri = `data:${mime};base64,${b64}`;
  cache.set(rutaRelativa, uri);
  return uri;
}

export const glifoUri = (slug: string, tinta: "bronce" | "oro") => dataUri(`glifos/${slug}-${tinta}.png`, "image/png");
export const logoUri = () => dataUri("logo-azul-anaite-marfil.png", "image/png");

/** @font-face de las tres familias. Variables (Montserrat, Lora) cubren todos los pesos con un archivo. */
export function cssFuentes(): string {
  const f = (familia: string, archivo: string, peso: string, estilo = "normal") =>
    `@font-face{font-family:"${familia}";src:url(${dataUri(`fonts/${archivo}`, "font/ttf")}) format("truetype");font-weight:${peso};font-style:${estilo};}`;
  return [
    f("Montserrat", "Montserrat-VF.ttf", "100 900"),
    f("Lora", "Lora-VF.ttf", "400 700"),
    f("Lora", "Lora-Italic-VF.ttf", "400 700", "italic"),
    f("Lato", "Lato-Light.ttf", "300"),
    f("Lato", "Lato-Regular.ttf", "400"),
    f("Lato", "Lato-Bold.ttf", "700"),
    f("Lato", "Lato-Italic.ttf", "400", "italic"),
  ].join("\n");
}
