/**
 * Muestra local del Oráculo: arma el HTML con content/oraculo, lo imprime con
 * Chromium y reporta páginas, tiempo y memoria. NO escribe dentro del repo:
 * la salida va a --out (usa el scratchpad de la sesión o una carpeta temporal).
 *
 *   bun run oraculo:muestra -- --nombre "Persona Ficticia" --fecha 1990-05-14 \
 *     --genero mujer|hombre|neutro [--compra 2026-10-04] [--out DIR] [--relleno] [--html] [--medir]
 *
 *   --relleno   si falta un archivo de content/, usa texto de prueba (no apto para compradores)
 *   --html      además deja el HTML para inspeccionarlo
 */
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { PDFDocument } from "pdf-lib";
import { Contenido, fuenteDeDisco } from "../../src/lib/oraculo/contenido";
import { relleno } from "../../src/lib/oraculo/fixtures";
import { esGenero } from "../../src/lib/oraculo/genero";
import { construirOraculo, valoresDe } from "../../src/lib/oraculo/maqueta";
import { htmlAPdf } from "../../src/lib/oraculo/render";

const RAIZ = resolve(import.meta.dir, "../..");
const args = process.argv.slice(2);
const val = (k: string) => (args.includes(k) ? args[args.indexOf(k) + 1] : undefined);

const nombre = val("--nombre") ?? "Persona Ficticia";
const fecha = val("--fecha") ?? "1990-05-14";
const genero = val("--genero") ?? "neutro";
const hoy = new Date();
const compra = val("--compra") ?? `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
const out = resolve(val("--out") ?? join(tmpdir(), "oraculo-muestras"));

if (!esGenero(genero)) {
  console.error(`--genero debe ser mujer, hombre o neutro (llegó «${genero}»).`);
  process.exit(1);
}
if (out.startsWith(RAIZ)) {
  console.error("La salida no puede ir dentro del repo. Usa --out con una carpeta fuera de él.");
  process.exit(1);
}
mkdirSync(out, { recursive: true });

/** Memoria residente (KB) de un proceso y todos sus descendientes. */
function rssArbol(pid: number): number {
  try {
    const tabla = execSync("ps -A -o pid=,ppid=,rss=", { encoding: "utf8" })
      .trim()
      .split("\n")
      .map((l) => l.trim().split(/\s+/).map(Number));
    const hijos = new Map<number, number[]>();
    for (const [p, pp] of tabla) hijos.set(pp, [...(hijos.get(pp) ?? []), p]);
    const rss = new Map(tabla.map(([p, , r]) => [p, r]));
    const pila = [pid];
    let total = 0;
    while (pila.length) {
      const p = pila.pop()!;
      total += rss.get(p) ?? 0;
      pila.push(...(hijos.get(p) ?? []));
    }
    return total;
  } catch {
    return 0;
  }
}

const t0 = Date.now();
const contenido = new Contenido(fuenteDeDisco(join(RAIZ, "content/oraculo")), genero, valoresDe({ nombre, fechaNacimiento: fecha, genero, fechaCompra: compra }), {
  relleno: args.includes("--relleno") ? relleno : undefined,
});
const r = construirOraculo({ nombre, fechaNacimiento: fecha, genero, fechaCompra: compra }, contenido);
const tMaqueta = Date.now() - t0;

let picoKB = 0;
let sonda: ReturnType<typeof setInterval> | undefined;
const render = await htmlAPdf(r.html, {
  medir: args.includes("--medir"),
  alAbrir: (b) => {
    const pid = b.process()?.pid;
    if (pid) sonda = setInterval(() => (picoKB = Math.max(picoKB, rssArbol(pid))), 100);
  },
});
if (sonda) clearInterval(sonda);

const base = `oraculo-${genero}-${fecha}`;
const archivo = join(out, `${base}.pdf`);
writeFileSync(archivo, render.pdf);
if (args.includes("--html")) writeFileSync(join(out, `${base}.html`), r.html);
const paginas = (await PDFDocument.load(render.pdf)).getPageCount();

console.log(JSON.stringify({
  pdf: archivo,
  paginas,
  kb: Math.round(render.pdf.length / 1024),
  kin: r.kin,
  trecena: r.trecena,
  ms: { maqueta: tMaqueta, ...render.ms, todo: Date.now() - t0 },
  memoria_mb: { chromium_pico: Math.round(picoKB / 1024), node_rss: Math.round(process.memoryUsage().rss / 1048576) },
  sinAprobar: r.sinAprobar.length,
  rellenadas: r.rellenadas,
  avisos: r.avisos,
  secciones: render.secciones?.map((x) => `${x.mm >= 252 ? "DESBORDA " : ""}${x.mm} mm · ${x.kicker}`),
}, null, 2));
