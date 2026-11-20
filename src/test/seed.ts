/**
 * Lee nahuales y tonos de supabase/seed.sql para los tests (los mismos textos
 * que la base). Solo lectura; no toca ninguna base.
 */
import { readFileSync } from "fs";
import path from "path";
import { atributosCanon } from "@/data/maices";
import type { NahualDB, TonoDB } from "@/hooks/useMayanData";

type Valor = string | number | string[];

/** Tuplas `( ... )` de un bloque INSERT ... VALUES. */
function tuplas(sql: string, tabla: string): Valor[][] {
  const inicio = sql.indexOf(`INSERT INTO public.${tabla}`);
  const valores = sql.indexOf("VALUES", inicio) + "VALUES".length;
  const filas: Valor[][] = [];
  let i = valores;
  let fila: Valor[] | null = null;
  let arreglo: string[] | null = null;
  while (i < sql.length) {
    const c = sql[i];
    if (c === "'") {
      let s = "";
      i++;
      while (i < sql.length) {
        if (sql[i] === "'" && sql[i + 1] === "'") { s += "'"; i += 2; continue; }
        if (sql[i] === "'") break;
        s += sql[i++];
      }
      i++;
      (arreglo ?? fila)?.push(s);
      continue;
    }
    if (sql.startsWith("ARRAY[", i)) { arreglo = []; i += 6; continue; }
    if (c === "]" && arreglo) { fila?.push(arreglo); arreglo = null; i++; continue; }
    if (c === "(" && !fila) { fila = []; i++; continue; }
    if (c === ")" && fila) { filas.push(fila); fila = null; i++; continue; }
    if (c === ";" && !fila) break;
    if (fila && !arreglo && /\d/.test(c)) {
      const m = /^\d+/.exec(sql.slice(i))!;
      fila.push(Number(m[0]));
      i += m[0].length;
      continue;
    }
    i++;
  }
  return filas;
}

const sql = readFileSync(path.resolve(__dirname, "../../supabase/seed.sql"), "utf8");

export const NAHUALES_SEED: NahualDB[] = tuplas(sql, "nahuales").map((f) =>
  atributosCanon({
    id: String(f[0]),
    index_num: f[0] as number,
    nombre: f[1] as string,
    significado: f[2] as string,
    descripcion: f[3] as string,
    elemento: f[4] as string,
    animal_guia: f[5] as string,
    punto_cardinal: f[6] as string,
    color_maiz: f[7] as string,
    parte_cuerpo: f[8] as string,
    lugar_poder: f[9] as string,
    elemento_conexion: f[10] as string,
    cualidades: f[11] as string[],
    sombras: f[12] as string[],
    fecundado_en: null,
  })
);

export const TONOS_SEED: TonoDB[] = tuplas(sql, "tonos").map((f) => ({
  id: String(f[0]),
  numero: f[0] as number,
  nombre: f[1] as string,
  significado: f[2] as string,
  descripcion: f[3] as string,
  cualidades: f[4] as string[],
}));
