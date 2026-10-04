/**
 * Canon de los cuatro maíces — FUENTE ÚNICA DE VERDAD.
 * ------------------------------------------------------------------
 * Los colores del maíz giran de cuatro en cuatro desde Imox, y cada maíz
 * tiene su elemento. La app muestra estos valores aunque la tabla `nahuales`
 * de Supabase aún traiga otros (ver la migración 20261004000000).
 *
 * Direcciones: Oeste (negro) está CONFIRMADO por Azul Anaité. Oriente (rojo),
 * Norte (blanco) y Sur (amarillo) coinciden con lo que la app ya mostraba y
 * quedan marcadas `confirmada: false` hasta que ella las valide.
 */

export type MaizColor = "Rojo" | "Blanco" | "Negro" | "Amarillo";
export type Elemento = "Agua" | "Aire" | "Tierra" | "Fuego";
export type Direccion = "Este" | "Norte" | "Oeste" | "Sur";

export interface MaizInfo {
  color: MaizColor;
  elemento: Elemento;
  direccion: Direccion;
  /** Etiqueta con la que se nombra el punto cardinal en textos. */
  direccionTexto: string;
  confirmada: boolean;
  nahuales: readonly string[];
}

export const MAICES: readonly MaizInfo[] = [
  {
    color: "Rojo",
    elemento: "Agua",
    direccion: "Este",
    direccionTexto: "Oriente",
    confirmada: false,
    nahuales: ["Imox", "Kan", "Toj", "Aj", "No'j"],
  },
  {
    color: "Blanco",
    elemento: "Aire",
    direccion: "Norte",
    direccionTexto: "Norte",
    confirmada: false,
    nahuales: ["Iq'", "Kame", "Tz'i'", "I'x", "Tijax"],
  },
  {
    color: "Negro",
    elemento: "Tierra",
    direccion: "Oeste",
    direccionTexto: "Oeste, el atardecer",
    confirmada: true,
    nahuales: ["Aq'ab'al", "Kej", "B'atz'", "Tz'ikin", "Kawoq"],
  },
  {
    color: "Amarillo",
    elemento: "Fuego",
    direccion: "Sur",
    direccionTexto: "Sur",
    confirmada: false,
    nahuales: ["K'at", "Q'anil", "E", "Ajmaq", "Ajpu"],
  },
] as const;

const porNahual = new Map<string, MaizInfo>(
  MAICES.flatMap((m) => m.nahuales.map((n) => [n, m] as const))
);

/** Maíz, elemento y dirección de un nahual por su nombre (como está en la BD). */
export function getMaizInfo(nombreNahual: string): MaizInfo | undefined {
  return porNahual.get(nombreNahual);
}

/**
 * Atributos del nahual con el canon aplicado encima de lo que traiga la BD.
 * Si el nahual no está en el canon se devuelve lo de la BD tal cual.
 */
export function atributosCanon<T extends { nombre: string; elemento: string; color_maiz: string; punto_cardinal: string }>(
  nahual: T
): T {
  const info = getMaizInfo(nahual.nombre);
  if (!info) return nahual;
  return {
    ...nahual,
    elemento: info.elemento,
    color_maiz: info.color,
    punto_cardinal: info.direccion,
  };
}
