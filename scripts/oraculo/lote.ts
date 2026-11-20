/**
 * Lote de prueba del Oráculo: un PDF por kin (260 fechas de nacimiento distintas)
 * con un solo Chromium abierto. NO guarda los PDF: solo cuenta páginas, tiempo
 * y busca desbordes. Es la prueba que el plan pide antes de abrir ventas.
 *
 *   bun run oraculo:lote -- [--genero mujer|hombre|neutro] [--paso 1] [--nombre "Persona Ficticia"] [--relleno]
 *
 *   --paso N   toma un kin de cada N (1 = los 260)
 */
import { execSync } from "node:child_process";
import { join, resolve } from "node:path";
import { PDFDocument } from "pdf-lib";
import { Contenido, fuenteDeDisco } from "../../src/lib/oraculo/contenido";
import { relleno } from "../../src/lib/oraculo/fixtures";
import { esGenero } from "../../src/lib/oraculo/genero";
import { construirOraculo, valoresDe } from "../../src/lib/oraculo/maqueta";
import { imprimirEn, lanzar } from "../../src/lib/oraculo/render";

const RAIZ = resolve(import.meta.dir, "../..");
const args = process.argv.slice(2);
const val = (k: string) => (args.includes(k) ? args[args.indexOf(k) + 1] : undefined);
const genero = val("--genero") ?? "neutro";
const paso = Number(val("--paso") ?? 1);
const nombre = val("--nombre") ?? "Persona Ficticia";
if (!esGenero(genero)) throw new Error("--genero inválido");

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fuente = fuenteDeDisco(join(RAIZ, "content/oraculo"));
const compra = "2026-10-04";

const rss = (pid: number) => {
  try {
    const t = execSync("ps -A -o pid=,ppid=,rss=", { encoding: "utf8" }).trim().split("\n").map((l) => l.trim().split(/\s+/).map(Number));
    const hijos = new Map<number, number[]>();
    for (const [p, pp] of t) hijos.set(pp, [...(hijos.get(pp) ?? []), p]);
    const r = new Map(t.map(([p, , x]) => [p, x]));
    let total = 0;
    const pila = [pid];
    while (pila.length) {
      const p = pila.pop()!;
      total += r.get(p) ?? 0;
      pila.push(...(hijos.get(p) ?? []));
    }
    return total;
  } catch {
    return 0;
  }
};

const navegador = await lanzar();
let pico = 0;
const pid = navegador.process()?.pid;
const sonda = pid ? setInterval(() => (pico = Math.max(pico, rss(pid))), 250) : undefined;

const paginasPorKin: Record<string, number> = {};
const tiempos: number[] = [];
const kb: number[] = [];
const errores: string[] = [];
const base = new Date(2000, 0, 1, 12); // 260 días consecutivos = los 260 kines
const t0 = Date.now();
for (let i = 0; i < 260; i += paso) {
  const f = iso(new Date(base.getFullYear(), base.getMonth(), base.getDate() + i, 12));
  try {
    const datos = { nombre, fechaNacimiento: f, genero, fechaCompra: compra };
    const c = new Contenido(fuente, genero, valoresDe(datos), { relleno: args.includes("--relleno") ? relleno : undefined });
    const r = construirOraculo(datos, c);
    const { pdf, ms } = await imprimirEn(navegador, r.html);
    const n = (await PDFDocument.load(pdf)).getPageCount();
    paginasPorKin[`${r.kin}`] = n;
    tiempos.push(ms);
    kb.push(pdf.length / 1024);
  } catch (e) {
    errores.push(`${f}: ${(e as Error).message}`);
  }
}
if (sonda) clearInterval(sonda);
await navegador.close();

const dist: Record<number, number> = {};
for (const n of Object.values(paginasPorKin)) dist[n] = (dist[n] ?? 0) + 1;
tiempos.sort((a, b) => a - b);
const pct = (p: number) => tiempos[Math.min(tiempos.length - 1, Math.floor(tiempos.length * p))];
console.log(JSON.stringify({
  genero,
  pdfs: tiempos.length,
  errores: errores.length,
  primerosErrores: errores.slice(0, 5),
  paginas: dist,
  mas_largos: Object.entries(paginasPorKin).sort((a, b) => b[1] - a[1]).slice(0, 5),
  ms_por_pdf: { mediana: pct(0.5), p95: pct(0.95), max: tiempos[tiempos.length - 1] },
  kb: { min: Math.round(Math.min(...kb)), max: Math.round(Math.max(...kb)) },
  chromium_pico_mb: Math.round(pico / 1024),
  total_s: Math.round((Date.now() - t0) / 1000),
}, null, 2));
