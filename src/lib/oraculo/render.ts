import puppeteer, { type Browser } from "puppeteer-core";

/**
 * HTML → PDF con Chromium. Dos orígenes del binario:
 *  - local (Mac/PC): CHROME_PATH o la ruta de Google Chrome en macOS;
 *  - serverless (Vercel/Lambda): @sparticuz/chromium, que trae su propio binario.
 */

const CHROME_MAC = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

export interface OpcionesRender {
  /** Ruta de un Chrome/Chromium local. Si falta, se intenta CHROME_PATH y luego @sparticuz/chromium. */
  chromePath?: string;
  /** Se llama una vez con el navegador abierto (la muestra lo usa para medir memoria). */
  alAbrir?: (navegador: Browser) => void;
  /** Mide cuánto ocupa cada <section class="pag"> (en mm de alto sobre el ancho útil de 170 mm). */
  medir?: boolean;
}

export interface ResultadoRender {
  pdf: Buffer;
  /** Milisegundos por etapa. */
  ms: { lanzar: number; contenido: number; imprimir: number; total: number };
  /** Solo con `medir`: página útil de A4 = 252 mm; más que eso desborda a la hoja siguiente. */
  secciones?: { kicker: string; mm: number }[];
}

export async function lanzar(o: OpcionesRender = {}): Promise<Browser> {
  const local = o.chromePath ?? process.env.CHROME_PATH ?? (process.platform === "darwin" ? CHROME_MAC : undefined);
  if (local) {
    return puppeteer.launch({ executablePath: local, headless: true, args: ["--no-sandbox", "--disable-gpu", "--font-render-hinting=none"] });
  }
  const { default: chromium } = await import("@sparticuz/chromium");
  return puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: "shell",
  });
}

export async function htmlAPdf(html: string, opciones: OpcionesRender = {}): Promise<ResultadoRender> {
  const t0 = Date.now();
  const navegador = await lanzar(opciones);
  opciones.alAbrir?.(navegador);
  const t1 = Date.now();
  try {
    const pagina = await navegador.newPage();
    await pagina.setContent(html, { waitUntil: "load", timeout: 60_000 });
    await pagina.evaluate(() => document.fonts.ready.then(() => undefined));
    const t2 = Date.now();
    let secciones: ResultadoRender["secciones"];
    if (opciones.medir) {
      secciones = await pagina.evaluate(() => {
        document.body.style.width = "170mm";
        return [...document.querySelectorAll<HTMLElement>("section.pag")].map((e) => ({
          kicker: e.querySelector(".kicker")?.textContent ?? "",
          mm: Math.round(((e.getBoundingClientRect().height * 25.4) / 96) * 10) / 10,
        }));
      });
    }
    const pdf = await pagina.pdf({ preferCSSPageSize: true, printBackground: true });
    const t3 = Date.now();
    return { pdf: Buffer.from(pdf), ms: { lanzar: t1 - t0, contenido: t2 - t1, imprimir: t3 - t2, total: t3 - t0 }, secciones };
  } finally {
    await navegador.close();
  }
}

/** Imprime con un navegador ya abierto (lotes: evita pagar el arranque de Chromium cada vez). */
export async function imprimirEn(navegador: Browser, html: string): Promise<{ pdf: Buffer; ms: number }> {
  const t0 = Date.now();
  const pagina = await navegador.newPage();
  try {
    await pagina.setContent(html, { waitUntil: "load", timeout: 60_000 });
    await pagina.evaluate(() => document.fonts.ready.then(() => undefined));
    const pdf = await pagina.pdf({ preferCSSPageSize: true, printBackground: true });
    return { pdf: Buffer.from(pdf), ms: Date.now() - t0 };
  } finally {
    await pagina.close();
  }
}
