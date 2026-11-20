/**
 * Cuenta Larga y Haab' — correlación estándar GMT (584283).
 * ------------------------------------------------------------------
 * Misma base que el Cholq'ij de la app, así que no se contradicen.
 * Verificado contra las fechas ancla de Azul Anaité (ver tests).
 */

export const CORRELACION_GMT = 584283;

export const HAAB_MESES = [
  "Pop", "Wo", "Sip", "Sotz'", "Sek", "Xul", "Yaxk'in", "Mol", "Ch'en", "Yax",
  "Sak'", "Keh", "Mak", "K'ank'in", "Muwan", "Pax", "K'ayab", "Kumk'u", "Wayeb'",
] as const;

/** Número de día juliano (a mediodía) de una fecha del calendario gregoriano. */
export function julianDayNumber(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/** Días transcurridos desde el inicio de la era (13.0.0.0.0 = 0). */
export function diasDesdeCreacion(date: Date): number {
  return julianDayNumber(date.getFullYear(), date.getMonth() + 1, date.getDate()) - CORRELACION_GMT;
}

export interface CuentaLargaResult {
  baktun: number;
  katun: number;
  tun: number;
  winal: number;
  kin: number;
  /** "13.0.13.17.14" */
  texto: string;
}

export function calcularCuentaLarga(date: Date): CuentaLargaResult {
  let d = diasDesdeCreacion(date);
  const baktun = Math.floor(d / 144000);
  d -= baktun * 144000;
  const katun = Math.floor(d / 7200);
  d -= katun * 7200;
  const tun = Math.floor(d / 360);
  d -= tun * 360;
  const winal = Math.floor(d / 20);
  const kin = d - winal * 20;
  return { baktun, katun, tun, winal, kin, texto: `${baktun}.${katun}.${tun}.${winal}.${kin}` };
}

export interface HaabResult {
  dia: number;
  mes: string;
  texto: string; // "7 Yax"
}

/** Posición Haab': 4 Ajpu 8 Kumk'u = día 0 de la era, posición Haab' 348. */
export function calcularHaab(date: Date): HaabResult {
  const posicion = (((diasDesdeCreacion(date) + 348) % 365) + 365) % 365;
  const mesIdx = Math.floor(posicion / 20);
  const dia = posicion % 20;
  const mes = HAAB_MESES[mesIdx];
  return { dia, mes, texto: `${dia} ${mes}` };
}
