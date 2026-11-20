/**
 * Género con el que se redacta el Oráculo. «neutro» es la opción «Prefiero no
 * decirlo»: texto sin marca de género. Lo elige quien compra; nunca se deduce
 * del nombre.
 */
export const GENEROS = ["mujer", "hombre", "neutro"] as const;
export type Genero = (typeof GENEROS)[number];

export const ETIQUETAS_GENERO: Record<Genero, string> = {
  mujer: "Mujer",
  hombre: "Hombre",
  neutro: "Prefiero no decirlo",
};

export function esGenero(v: unknown): v is Genero {
  return typeof v === "string" && (GENEROS as readonly string[]).includes(v);
}

/** Posición de cada género dentro de `{{femenino|masculino|neutro}}`. */
export const INDICE_GENERO: Record<Genero, 0 | 1 | 2> = { mujer: 0, hombre: 1, neutro: 2 };
