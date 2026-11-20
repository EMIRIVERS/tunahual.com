import {
  calculateMayanCrossFromDB,
  calculateMayanKinFromDB,
  calculateTrecena,
  mod,
  type MayanCrossDB,
  type MayanKinDB,
} from "../../utils/mayanCalculations.js";
import type { NahualDB, TonoDB } from "../../types/mayan.js";
import { nahualToSlug } from "../../data/nahualSlugs.js";
import { getMaizInfo, type MaizInfo } from "../../data/maices.js";

/**
 * Cálculos del Oráculo. Usa SOLO `mayanCalculations.ts` (ancla 8-ago-2002 = 12 E,
 * cruz con ±8 vertical y ±6 horizontal). NO usa el `calculateMayanCross` viejo de
 * `mayanCalendar.ts`, que desplaza otras distancias y da otra cruz.
 * No toca la base: solo necesita el índice y el nombre de cada nahual.
 */

export const NOMBRES_NAHUAL = Object.keys(nahualToSlug); // Imox = 1 … Ajpu = 20

// mayanCalculations solo lee `index_num`/`nombre` y `numero`; el resto de la ficha vive en content/.
const NAHUALES = NOMBRES_NAHUAL.map((nombre, i) => ({ index_num: i + 1, nombre })) as unknown as NahualDB[];
const TONOS = Array.from({ length: 13 }, (_, i) => ({ numero: i + 1 })) as unknown as TonoDB[];

export interface KinInfo {
  tono: number;
  nahual: string;
  slug: string;
  indice: number; // 1–20
  kin: number; // 1–260
  /** «11 Kej» */
  etiqueta: string;
  maiz: MaizInfo;
}

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/** «YYYY-MM-DD» → Date local a mediodía (mayanCalculations lee año/mes/día locales). */
export function fechaDesdeISO(iso: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) throw new Error(`Fecha inválida «${iso}»: se espera YYYY-MM-DD.`);
  const [y, mes, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const fecha = new Date(y, mes - 1, d, 12);
  if (fecha.getFullYear() !== y || fecha.getMonth() !== mes - 1 || fecha.getDate() !== d) {
    throw new Error(`Fecha inexistente «${iso}».`);
  }
  return fecha;
}

/** «4 de octubre de 2026», sin depender de ICU/Intl del entorno. */
export function fechaLarga(iso: string): string {
  const f = fechaDesdeISO(iso);
  return `${f.getDate()} de ${MESES[f.getMonth()]} de ${f.getFullYear()}`;
}

/** Fecha de compra en la zona horaria del negocio (el día que cuenta es el de quien paga). */
export function fechaISOEnZona(epochSegundos: number, zona = "America/Mexico_City"): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: zona, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(epochSegundos * 1000)
  );
}

function aKinInfo(k: MayanKinDB): KinInfo {
  const nahual = NOMBRES_NAHUAL[k.nahual.index_num - 1];
  return {
    tono: k.tone.numero,
    nahual,
    slug: nahualToSlug[nahual],
    indice: k.nahual.index_num,
    kin: k.kinNumber,
    etiqueta: `${k.tone.numero} ${nahual}`,
    maiz: getMaizInfo(nahual) as MaizInfo,
  };
}

export function kinDeFecha(iso: string): KinInfo {
  const k = calculateMayanKinFromDB(fechaDesdeISO(iso), NAHUALES, TONOS);
  if (!k) throw new Error(`No se pudo calcular el kin de ${iso}.`);
  return aKinInfo(k);
}

/** Nahual que rige la trecena (el del día 1) de un kin. */
export function trecenaDeFecha(iso: string): string {
  const k = calculateMayanKinFromDB(fechaDesdeISO(iso), NAHUALES, TONOS);
  const t = k && calculateTrecena(k, NAHUALES);
  if (!t) throw new Error(`No se pudo calcular la trecena de ${iso}.`);
  return NOMBRES_NAHUAL[t.index_num - 1];
}

/* ───────────── Energía del día de compra ───────────── */

export interface EnergiaDia extends KinInfo {
  fechaISO: string;
  fechaTexto: string;
  trecena: string;
}

export function energiaDelDia(fechaISO: string): EnergiaDia {
  return { ...kinDeFecha(fechaISO), fechaISO, fechaTexto: fechaLarga(fechaISO), trecena: trecenaDeFecha(fechaISO) };
}

/* ───────────── Cruz de nueve ───────────── */

export type PosicionCruz =
  | "origen-poder"
  | "origen-concepcion"
  | "origen-esencia"
  | "mano-derecha"
  | "nacimiento"
  | "mano-izquierda"
  | "destino-poder"
  | "destino-52"
  | "destino-esencia";

export interface CeldaCruz extends KinInfo {
  posicion: PosicionCruz;
  fila: 0 | 1 | 2;
  /** Columna en la hoja: 0 izquierda, 1 centro, 2 derecha. */
  columna: 0 | 1 | 2;
  /** Rótulo corto bajo el glifo, como en el diagrama original. */
  rotulo: string;
  /** El kin cae dentro de la trecena de nacimiento (comparte nahual regente). */
  enTuTrecena: boolean;
}

export interface CruzOraculo {
  nacimiento: KinInfo;
  trecena: string;
  /** Las 9 celdas en el orden de lectura (fila a fila, de izquierda a derecha de la hoja). */
  celdas: CeldaCruz[];
}

/**
 * Orden de la hoja (verificado con el original, 11 Kej):
 *   fila 0: concepción derecho | concepción centro | concepción izquierdo
 *   fila 1: mano derecha       | nacimiento        | mano izquierda
 *   fila 2: destino derecho    | destino centro    | destino izquierdo
 * `derecho` (−6) cae a la IZQUIERDA de la hoja; `izquierdo` (+6) a la derecha.
 */
const DISPOSICION: { posicion: PosicionCruz; rotulo: string; leer: (c: MayanCrossDB) => MayanKinDB }[] = [
  { posicion: "origen-poder", rotulo: "Origen · poder", leer: (c) => c.concepcion.derecho.kin },
  { posicion: "origen-concepcion", rotulo: "Origen · concepción", leer: (c) => c.concepcion.centro.kin },
  { posicion: "origen-esencia", rotulo: "Origen · esencia", leer: (c) => c.concepcion.izquierdo.kin },
  { posicion: "mano-derecha", rotulo: "Mano derecha · lo que das", leer: (c) => c.nacimiento.derecho.kin },
  { posicion: "nacimiento", rotulo: "Nacimiento · tu esencia", leer: (c) => c.nacimiento.centro.kin },
  { posicion: "mano-izquierda", rotulo: "Mano izquierda · lo que recibes", leer: (c) => c.nacimiento.izquierdo.kin },
  { posicion: "destino-poder", rotulo: "Destino · poder", leer: (c) => c.destino.derecho.kin },
  { posicion: "destino-52", rotulo: "Destino · desde los 52", leer: (c) => c.destino.centro.kin },
  { posicion: "destino-esencia", rotulo: "Destino · esencia", leer: (c) => c.destino.izquierdo.kin },
];

export function cruzOraculo(fechaNacimientoISO: string): CruzOraculo {
  const fecha = fechaDesdeISO(fechaNacimientoISO);
  const cruz = calculateMayanCrossFromDB(fecha, NAHUALES, TONOS);
  if (!cruz) throw new Error(`No se pudo calcular la cruz de ${fechaNacimientoISO}.`);
  const nacimiento = aKinInfo(cruz.nacimiento.centro.kin);
  const regente = calculateTrecena(cruz.nacimiento.centro.kin, NAHUALES)!.index_num;

  const celdas = DISPOSICION.map((d, i): CeldaCruz => {
    const k = d.leer(cruz);
    const regenteDeK = calculateTrecena(k, NAHUALES)!.index_num;
    return {
      ...aKinInfo(k),
      posicion: d.posicion,
      fila: Math.floor(i / 3) as 0 | 1 | 2,
      columna: (i % 3) as 0 | 1 | 2,
      rotulo: d.rotulo,
      enTuTrecena: regenteDeK === regente,
    };
  });
  return { nacimiento, trecena: NOMBRES_NAHUAL[regente - 1], celdas };
}

/* ───────────── Lecturas calculadas de la cruz (clase «d» del plan) ───────────── */

export interface AnalisisCruz {
  /** Colores de maíz de las tres casillas del canal central (origen, nacimiento, destino). */
  canalCentral: string[];
  /** Solo si los tres del canal son del mismo maíz. */
  canalUnico: MaizInfo | null;
  /** Colores de las seis casillas laterales. */
  lados: string[];
  ladosUnico: MaizInfo | null;
  /** Nahuales que aparecen más de una vez, con las posiciones donde caen. */
  repetidos: { nahual: string; posiciones: PosicionCruz[] }[];
  /** Celdas que viven dentro de la trecena de nacimiento. */
  enTuTrecena: CeldaCruz[];
  /** ¿Todas caen en días impares? (el plan lo destaca cuando se da) */
  todasImpares: boolean;
}

export function analizarCruz(cruz: CruzOraculo): AnalisisCruz {
  const centro = cruz.celdas.filter((c) => c.columna === 1);
  const lados = cruz.celdas.filter((c) => c.columna !== 1);
  const unico = (cs: CeldaCruz[]) => (new Set(cs.map((c) => c.maiz.color)).size === 1 ? cs[0].maiz : null);

  const porNahual = new Map<string, PosicionCruz[]>();
  for (const c of cruz.celdas) porNahual.set(c.nahual, [...(porNahual.get(c.nahual) ?? []), c.posicion]);
  const repetidos = [...porNahual].filter(([, p]) => p.length > 1).map(([nahual, posiciones]) => ({ nahual, posiciones }));

  const dentro = cruz.celdas.filter((c) => c.enTuTrecena);
  return {
    canalCentral: centro.map((c) => c.maiz.color),
    canalUnico: unico(centro),
    lados: lados.map((c) => c.maiz.color),
    ladosUnico: unico(lados),
    repetidos,
    enTuTrecena: dentro,
    todasImpares: dentro.length > 0 && dentro.every((c) => c.tono % 2 === 1),
  };
}

/* ───────────── Tabla de la trecena ───────────── */

export interface DiaTrecena {
  dia: number; // 1–13 = tono
  nahual: string;
  /** Celdas de la cruz que caen exactamente en este día. */
  marcas: CeldaCruz[];
  esTuDia: boolean;
}

/** Los 13 días de la trecena de nacimiento: el día 1 es el nahual regente. */
export function tablaTrecena(cruz: CruzOraculo): DiaTrecena[] {
  const regente = NOMBRES_NAHUAL.indexOf(cruz.trecena);
  return Array.from({ length: 13 }, (_, i) => {
    const nahual = NOMBRES_NAHUAL[mod(regente + i, 20)];
    const dia = i + 1;
    return {
      dia,
      nahual,
      marcas: cruz.celdas.filter((c) => c.enTuTrecena && c.tono === dia && c.nahual === nahual),
      esTuDia: cruz.nacimiento.tono === dia && cruz.nacimiento.nahual === nahual,
    };
  });
}

/* ───────────── Regresos ───────────── */

/**
 * Próximas veces que el kin de nacimiento vuelve a caer (cada 260 días),
 * contando desde el día de compra (sin incluirlo). Es el «cumpleaños maya».
 */
export function proximosRegresos(fechaNacimientoISO: string, desdeISO: string, cuantos = 3): string[] {
  const nac = fechaDesdeISO(fechaNacimientoISO);
  const desde = fechaDesdeISO(desdeISO).getTime();
  const salida: string[] = [];
  for (let k = 1; salida.length < cuantos && k < 10_000; k++) {
    const f = new Date(nac.getFullYear(), nac.getMonth(), nac.getDate() + 260 * k, 12);
    if (f.getTime() > desde) {
      salida.push(`${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(f.getDate()).padStart(2, "0")}`);
    }
  }
  return salida;
}
