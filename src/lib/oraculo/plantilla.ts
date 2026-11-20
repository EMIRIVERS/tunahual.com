import { INDICE_GENERO, type Genero } from "./genero.js";

/**
 * Motor de plantilla del Oráculo. TypeScript puro, sin dependencias: corre
 * igual en Vitest, en Bun (script de muestra) y en una función de Vercel.
 *
 * Marcadores:
 *   {{nombre}}                         token; el valor sale de `valores`
 *   {{femenina|masculino|neutro}}      tres variantes, en ESE orden (mujer, hombre, neutro)
 *   <!--solo:mujer--> … <!--/solo-->   bloque que solo ve ese género
 *
 * Es estricto a propósito: un token sin valor, una variante de menos o un bloque
 * sin cerrar lanzan `ErrorPlantilla`. Un PDF vendido con «{{nombre}}» a la vista
 * es peor que un PDF que no se genera.
 */

export class ErrorPlantilla extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "ErrorPlantilla";
  }
}

/** Tokens que el contenido puede usar. Cada uno debe llegar en `valores`. */
export const TOKENS = ["nombre", "fecha_compra", "kin_compra", "nahual_compra", "tono_compra", "trecena_compra"] as const;
export type Token = (typeof TOKENS)[number];

export type Valores = Partial<Record<Token, string>> & Record<string, string | undefined>;

const SOLO_ABRE = /<!--\s*solo:([a-z]+)\s*-->/g;
const SOLO_CIERRA = /<!--\s*\/solo\s*-->/g;

/** Contexto para que el error diga en qué archivo y línea está el marcador roto. */
function donde(texto: string, indice: number, origen?: string): string {
  const linea = texto.slice(0, indice).split("\n").length;
  return origen ? `${origen}:${linea}` : `línea ${linea}`;
}

/** Quita o conserva los bloques `<!--solo:X-->…<!--/solo-->`. No admite anidar. */
function aplicarBloques(texto: string, genero: Genero, origen?: string): string {
  let salida = "";
  let cursor = 0;
  SOLO_ABRE.lastIndex = 0;
  let abre: RegExpExecArray | null;
  while ((abre = SOLO_ABRE.exec(texto))) {
    const destino = abre[1];
    if (!(destino in INDICE_GENERO)) {
      throw new ErrorPlantilla(`Bloque «solo:${destino}» desconocido en ${donde(texto, abre.index, origen)} (válidos: mujer, hombre, neutro).`);
    }
    const desde = abre.index + abre[0].length;
    SOLO_CIERRA.lastIndex = desde;
    const cierra = SOLO_CIERRA.exec(texto);
    if (!cierra) {
      throw new ErrorPlantilla(`Bloque «solo:${destino}» sin cerrar en ${donde(texto, abre.index, origen)}: falta <!--/solo-->.`);
    }
    const dentro = texto.slice(desde, cierra.index);
    if (/<!--\s*solo:/.test(dentro)) {
      throw new ErrorPlantilla(`Bloques «solo» anidados en ${donde(texto, abre.index, origen)}: no se admiten.`);
    }
    const visible = destino === genero;
    const finCierre = cierra.index + cierra[0].length;
    const inicioLinea = texto.lastIndexOf("\n", abre.index - 1) + 1;
    const finLinea = texto.indexOf("\n", finCierre);
    const marcadoresSolos =
      texto.slice(inicioLinea, abre.index).trim() === "" && texto.slice(finCierre, finLinea === -1 ? undefined : finLinea).trim() === "";
    if (marcadoresSolos) {
      // Los marcadores ocupan líneas enteras: se quitan con su salto, sin dejar renglones vacíos (cuenta en listas).
      salida += texto.slice(cursor, inicioLinea) + (visible ? dentro.replace(/^\r?\n/, "") : "");
      cursor = finLinea === -1 ? texto.length : finLinea + 1;
    } else {
      salida += texto.slice(cursor, abre.index) + (visible ? dentro : "");
      cursor = finCierre;
    }
    SOLO_ABRE.lastIndex = cursor;
  }
  salida += texto.slice(cursor);
  if (SOLO_CIERRA.test(salida) || /<!--\s*\/solo\s*-->/.test(salida)) {
    throw new ErrorPlantilla(`Hay un <!--/solo--> sin su apertura${origen ? ` en ${origen}` : ""}.`);
  }
  // Un bloque oculto deja un hueco: se compacta para no dejar líneas en blanco de más.
  return salida.replace(/\n{3,}/g, "\n\n");
}

/**
 * Renderiza una plantilla para un género con los valores dados.
 * `origen` (ej. «nahual/kej.md») solo sirve para que los errores digan dónde.
 */
export function renderizarPlantilla(texto: string, genero: Genero, valores: Valores, origen?: string): string {
  if (!(genero in INDICE_GENERO)) throw new ErrorPlantilla(`Género inválido: «${String(genero)}».`);

  const sinBloques = aplicarBloques(texto, genero, origen);

  const salida = sinBloques.replace(/\{\{([^{}]*)\}\}/g, (_m, interior: string, desplazamiento: number) => {
    const sitio = donde(sinBloques, desplazamiento, origen);
    if (interior.includes("|")) {
      const variantes = interior.split("|");
      if (variantes.length !== 3) {
        throw new ErrorPlantilla(`Variante de género con ${variantes.length} opciones en ${sitio} («{{${interior}}}»): deben ser 3 (mujer|hombre|neutro).`);
      }
      return variantes[INDICE_GENERO[genero]];
    }
    const token = interior.trim();
    if (!/^[a-z_]+$/.test(token)) {
      throw new ErrorPlantilla(`Marcador ilegible «{{${interior}}}» en ${sitio}.`);
    }
    const valor = valores[token];
    if (valor === undefined || valor === "") {
      const conocido = (TOKENS as readonly string[]).includes(token);
      throw new ErrorPlantilla(
        conocido
          ? `Falta el valor del token «{{${token}}}» (${sitio}).`
          : `Token desconocido «{{${token}}}» en ${sitio} (válidos: ${TOKENS.join(", ")}).`
      );
    }
    return valor;
  });

  // Red de seguridad: nada de marcadores a la vista en lo que se imprime.
  if (/\{\{|\}\}|<!--\s*\/?solo/.test(salida)) {
    throw new ErrorPlantilla(`Quedó un marcador sin resolver en la salida${origen ? ` de ${origen}` : ""}: revisa llaves «{{ }}» sueltas.`);
  }
  return salida;
}

/** Lista los tokens que usa un texto, sin renderizarlo (para validar contenido sin género ni valores). */
export function tokensUsados(texto: string): string[] {
  const encontrados = new Set<string>();
  for (const m of texto.matchAll(/\{\{([^{}|]*)\}\}/g)) encontrados.add(m[1].trim());
  return [...encontrados];
}
