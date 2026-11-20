/**
 * Política de qué se lee sin pedir nada, qué se abre con correo y WhatsApp y
 * qué queda para el Mapa (de pago, fuera de la web). Los textos se recortan de
 * lo que ya existe en la base y en src/data; aquí no se redacta contenido
 * cultural nuevo, solo frases de unión con los datos del nahual y el tono.
 */

/** Primera oración de un texto: lo único interpretativo que se lee sin dejar datos. */
export function primeraFrase(texto: string | null | undefined): string {
  const limpio = (texto ?? "").replace(/\s+/g, " ").trim();
  const m = /^(.+?[.!?…])(\s|$)/.exec(limpio);
  return m ? m[1] : limpio;
}

/** Palabras reales (con letra o dígito) de un texto. */
export function contarPalabras(texto: string): number {
  return texto.split(/\s+/).filter((p) => /[\p{L}\d]/u.test(p)).length;
}

/** «a, b y c» */
export function enumerar(items: readonly string[]): string {
  const xs = items.map((x) => x.trim()).filter(Boolean);
  if (xs.length <= 1) return xs.join("");
  return `${xs.slice(0, -1).join(", ")} y ${xs[xs.length - 1]}`;
}

export interface NahualPublico {
  nombre: string;
  significado: string;
  descripcion: string;
  elemento: string;
  animal_guia: string;
  punto_cardinal: string;
  color_maiz: string;
  cualidades?: string[] | null;
}

export interface TonoPublico {
  numero: number;
  nombre: string;
  significado: string;
  descripcion: string;
  cualidades?: string[] | null;
}

/** Llamado a calcular el propio nahual (cierre de /nahual). */
export const LLAMADO_CALCULAR =
  "Tu nahual depende del día exacto en que naciste. Escribe tu fecha de nacimiento y verás al instante tu nahual y tu tono; si lo deseas, después se abren tu Cruz Maya de nueve energías y el cielo de tu nacimiento.";

/** Introducción de /nahual/<slug>: datos y descripción (las cualidades van en su lista). */
export function introNahual(n: NahualPublico): string[] {
  return [
    `${n.nombre} es uno de los veinte nahuales del Cholq'ij, el calendario sagrado maya de 260 días. Significa ${n.significado.toLowerCase()}. Su glifo es ${n.animal_guia}, su elemento es ${n.elemento.toLowerCase()} y su maíz es ${n.color_maiz.toLowerCase()}, del punto cardinal ${n.punto_cardinal}.`,
    n.descripcion.trim(),
  ];
}

/** Introducción de /kin/<slug>: el nahual, el tono y cómo se combinan. */
export function introKin(n: NahualPublico, t: TonoPublico, kinNumber: number) {
  const cualidades = n.cualidades ?? [];
  return {
    combinacion: `El Kin ${kinNumber} del calendario Maya Cholq'ij representa la combinación única del Nahual ${n.nombre} (${n.significado}) con el Tono ${t.numero} ${t.nombre} (${t.significado}). Esta energía cósmica combina las cualidades del elemento ${n.elemento} con la vibración numérica del ${t.numero}.`,
    nahual: [
      n.descripcion.trim(),
      `Su glifo es ${n.animal_guia} y está asociado con el punto cardinal ${n.punto_cardinal} y el color de maíz ${n.color_maiz}.`,
      cualidades.length > 0 ? `Sus cualidades principales: ${enumerar(cualidades.slice(0, 4).map((c) => c.toLowerCase()))}.` : "",
    ].filter(Boolean).join(" "),
    tono: t.descripcion.trim(),
    nacimiento: `Si naciste en un día con el Kin ${kinNumber}, las energías de ${n.nombre} y el Tono ${t.numero} influyen en tu misión de vida y personalidad.`,
  };
}
