import { NahualDB, TonoDB } from "@/hooks/useMayanData";

/**
 * Cargador del Año (Mam / Portador del Año)
 * ------------------------------------------------------------------
 * En el conteo maya k'iche' cada año solar (Haab', 365 días) es "cargado" por
 * uno de solo CUATRO Nahuales: Iq', Kej, E y No'j (espaciados 5 posiciones en
 * la rueda de 20, por eso se turnan año con año). Además el tono sube uno cada
 * año. El Cargador de una persona es el del año solar en que nació.
 *
 * ANCLA (confirmada por Azul Anaité, 3 oct 2026): el año maya 5141 empezó el
 * 18 de febrero de 2026 con 1 Kej. Hacia atrás/adelante cada año dura 365 días
 * (el Haab' no tiene bisiesto), así que la fecha gregoriana del inicio se
 * recorre un día cada cuatro años. Verificado: 5140 = 13 Iq' (feb 2025),
 * 5142 = 2 E (feb 2027), 5143 = 3 No'j (feb 2028).
 */

// ⚑ Interruptor de visibilidad. En false, la tarjeta Cargador NO se muestra en
// la app (el cálculo queda listo). Poner en true cuando Azul Anaité confirme la
// tradición del inicio de año solar y se ajuste HAAB_NEW_YEAR_ANCHOR.
export const CARGADOR_HABILITADO = false;

// Índices (index_num) de los 4 cargadores clásicos: Iq'(2), Kej(7), E(12), No'j(17).
export const CARGADORES_INDEX = [2, 7, 12, 17] as const;

// Ancla: 18 feb 2026 = 1 Kej, año maya 5141.
const HAAB_NEW_YEAR_ANCHOR = Date.UTC(2026, 1, 18, 12, 0, 0);
const ANCHOR_YEAR = 5141;
const ANCHOR_NAHUAL_INDEX = 7; // Kej
const ANCHOR_TONO = 1;
const HAAB_LENGTH = 365; // días del año solar maya (sin bisiesto)
const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Qué trae cada Cargador, en una línea (editable, tono sobrio). */
export const cargadorEsencia: Record<string, string> = {
  "Iq'": "Un año movido por el viento y la palabra: comunicación, cambios y limpieza.",
  Kej: "Un año sostenido por el venado: fuerza, equilibrio y armonía con la naturaleza.",
  E: "Un año de camino: viajes, búsqueda de destino y apertura de senderos.",
  "No'j": "Un año de conocimiento: claridad mental, estudio y buenas decisiones.",
};

export interface CargadorPuro {
  /** Número de año maya (5141 inicia el 18 feb 2026). */
  anio: number;
  /** index_num (1–20) del nahual cargador: siempre Iq'(2), Kej(7), E(12) o No'j(17). */
  nahualIndex: number;
  /** Tono del cargador (1–13): sube uno cada año. */
  tono: number;
  inicio: Date;
  fin: Date;
}

const mod = (n: number, m: number) => ((n % m) + m) % m;

/** Cargador del año solar que contiene `fecha`. Función pura, sin base de datos. */
export function cargadorPorFecha(fecha: Date): CargadorPuro {
  const ms = Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 12, 0, 0);
  const diffDays = Math.floor((ms - HAAB_NEW_YEAR_ANCHOR) / MS_PER_DAY);
  const yearIndex = Math.floor(diffDays / HAAB_LENGTH);
  const inicioMs = HAAB_NEW_YEAR_ANCHOR + yearIndex * HAAB_LENGTH * MS_PER_DAY;
  const dias = yearIndex * HAAB_LENGTH;
  const utc = (t: number) => {
    const d = new Date(t);
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  };
  return {
    anio: ANCHOR_YEAR + yearIndex,
    nahualIndex: mod(ANCHOR_NAHUAL_INDEX - 1 + dias, 20) + 1,
    tono: mod(ANCHOR_TONO - 1 + dias, 13) + 1,
    inicio: utc(inicioMs),
    fin: utc(inicioMs + (HAAB_LENGTH - 1) * MS_PER_DAY),
  };
}

export interface CargadorResult {
  /** Nahual que carga el año solar del nacimiento. */
  nahual: NahualDB;
  /** Tono con el que lo carga ese año (el "1" de "1 Kej"). */
  tono: number;
  /** Año maya (5141…). */
  anio: number;
  /** Inicio del año solar (fecha del Cargador). */
  inicio: Date;
  /** Fin del año solar (día previo al siguiente Cargador). */
  fin: Date;
  esencia: string;
}

/** Cargador del año solar que contiene `fecha`, con el nahual de la BD. */
export function calcularCargador(
  fecha: Date,
  nahuales: NahualDB[],
  _tonos?: TonoDB[]
): CargadorResult | null {
  if (nahuales.length === 0) return null;
  const c = cargadorPorFecha(fecha);
  const nahual = nahuales.find((n) => n.index_num === c.nahualIndex);
  if (!nahual) return null;
  return {
    nahual,
    tono: c.tono,
    anio: c.anio,
    inicio: c.inicio,
    fin: c.fin,
    esencia: cargadorEsencia[nahual.nombre] ?? "",
  };
}
