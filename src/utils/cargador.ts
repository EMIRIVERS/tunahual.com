import { NahualDB, TonoDB } from "@/hooks/useMayanData";
import { calculateMayanKinFromDB } from "@/utils/mayanCalculations";

/**
 * Cargador del Año (Mam / Portador del Año)
 * ------------------------------------------------------------------
 * En el conteo maya k'iche' cada año solar (Ab' / Haab', de 365 días) es
 * "cargado" por uno de solo CUATRO Nahuales, llamados los Cargadores. En la
 * tradición guatemalteca clásica son: Iq', Kej, E y No'j (están espaciados 5
 * posiciones en la rueda de 20, por eso se turnan año con año).
 *
 * El Cargador de una persona es el que rige el año solar en que nació.
 *
 * ⚠️ POR CONFIRMAR CON AZUL ANAITÉ: la fecha exacta del cambio de año solar
 * (cuándo se "sienta" el nuevo Cargador) varía por comunidad y correlación.
 * Aquí se define en UNA sola constante, `HAAB_NEW_YEAR_ANCHOR`. Basta que la
 * clienta confirme "el año que empezó en tal fecha lo cargó tal Nahual" y se
 * ajusta esa constante — el resto del cálculo se acomoda solo.
 *
 * Requisito de la constante: el Nahual de esa fecha debe ser uno de los 4
 * cargadores (si no, el cálculo lo detecta y avisa en consola).
 */

// ⚑ Interruptor de visibilidad. En false, la tarjeta Cargador NO se muestra en
// la app (el cálculo queda listo). Poner en true cuando Azul Anaité confirme la
// tradición del inicio de año solar y se ajuste HAAB_NEW_YEAR_ANCHOR.
export const CARGADOR_HABILITADO = false;

// Índices (index_num) de los 4 cargadores clásicos: Iq'(2), Kej(7), E(12), No'j(17).
export const CARGADORES_INDEX = [2, 7, 12, 17] as const;

// Ancla del Año Solar Maya. Referencia por defecto: 24 de febrero de 2024 = Iq'.
// (Ventana comúnmente citada del Año Nuevo Maya, finales de febrero.)
const HAAB_NEW_YEAR_ANCHOR = Date.UTC(2024, 1, 24, 12, 0, 0);
const HAAB_LENGTH = 365; // días del año solar maya (sin bisiesto)
const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Qué trae cada Cargador, en una línea (editable, tono sobrio). */
export const cargadorEsencia: Record<string, string> = {
  "Iq'": "Un año movido por el viento y la palabra: comunicación, cambios y limpieza.",
  Kej: "Un año sostenido por el venado: fuerza, equilibrio y armonía con la naturaleza.",
  E: "Un año de camino: viajes, búsqueda de destino y apertura de senderos.",
  "No'j": "Un año de conocimiento: claridad mental, estudio y buenas decisiones.",
};

export interface CargadorResult {
  /** Nahual que carga el año solar del nacimiento. */
  nahual: NahualDB;
  /** Inicio del año solar (fecha del Cargador). */
  inicio: Date;
  /** Fin del año solar (día previo al siguiente Cargador). */
  fin: Date;
  esencia: string;
}

/**
 * Devuelve el Cargador del año solar que contiene `birthDate`.
 * Retorna null si faltan datos o si el ancla no cae en un cargador válido.
 */
export function calcularCargador(
  birthDate: Date,
  nahuales: NahualDB[],
  tonos: TonoDB[]
): CargadorResult | null {
  if (nahuales.length === 0 || tonos.length === 0) return null;

  const birthMs = Date.UTC(
    birthDate.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate(),
    12,
    0,
    0
  );

  // ¿Cuántos años solares completos hay entre el ancla y el nacimiento?
  const diffDays = Math.floor((birthMs - HAAB_NEW_YEAR_ANCHOR) / MS_PER_DAY);
  const yearIndex = Math.floor(diffDays / HAAB_LENGTH);

  const inicioMs = HAAB_NEW_YEAR_ANCHOR + yearIndex * HAAB_LENGTH * MS_PER_DAY;
  const inicio = new Date(inicioMs);
  const fin = new Date(inicioMs + (HAAB_LENGTH - 1) * MS_PER_DAY);

  const kin = calculateMayanKinFromDB(inicio, nahuales, tonos);
  if (!kin) return null;

  if (!CARGADORES_INDEX.includes(kin.nahual.index_num as (typeof CARGADORES_INDEX)[number])) {
    // El ancla no cae en un cargador: hay que ajustar HAAB_NEW_YEAR_ANCHOR.
    console.warn(
      "[cargador] El ancla del año solar no cae en un Cargador válido:",
      kin.nahual.nombre,
      "(revisar HAAB_NEW_YEAR_ANCHOR)"
    );
    return null;
  }

  return {
    nahual: kin.nahual,
    inicio,
    fin,
    esencia: cargadorEsencia[kin.nahual.nombre] ?? "",
  };
}
