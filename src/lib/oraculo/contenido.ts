import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { renderizarPlantilla, ErrorPlantilla, type Valores } from "./plantilla.js";
import type { Genero } from "./genero.js";

/**
 * Lectura de content/oraculo/*.md (los textos de Azul Anaité, en borrador).
 * El archivo se renderiza COMPLETO con el género elegido ANTES de partirlo en
 * secciones: así un bloque <!--solo:mujer--> puede envolver hasta un «## título».
 */

export interface Documento {
  ruta: string;
  meta: Record<string, string>;
  /** `## nombre` → texto (sin la línea del título). */
  secciones: Record<string, string>;
  /** `### clave` dentro de cada `## nombre`. Solo existe donde el texto las trae. */
  subsecciones: Record<string, Record<string, string>>;
}

/** De dónde salen los archivos. En producción es el disco; en pruebas, un objeto en memoria. */
export interface FuenteContenido {
  /** Ruta relativa a content/oraculo (ej. «nahual/kej.md»). Null si no existe. */
  leer(ruta: string): string | null;
}

/** Lee de content/oraculo en disco (solo Node/Bun). */
export function fuenteDeDisco(raiz: string): FuenteContenido {
  return {
    leer(ruta) {
      const archivo = join(raiz, ruta);
      return existsSync(archivo) ? readFileSync(archivo, "utf8") : null;
    },
  };
}

export function fuenteEnMemoria(archivos: Record<string, string>): FuenteContenido {
  return { leer: (ruta) => archivos[ruta] ?? null };
}

/** Separa el frontmatter `---` (pares `clave: valor`, valores opcionalmente entre comillas). */
export function separarFrontmatter(texto: string): { meta: Record<string, string>; cuerpo: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(texto);
  if (!m) return { meta: {}, cuerpo: texto };
  const meta: Record<string, string> = {};
  for (const linea of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(linea);
    if (!kv) continue;
    meta[kv[1]] = kv[2].trim().replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
  }
  return { meta, cuerpo: texto.slice(m[0].length) };
}

/** Parte un cuerpo ya renderizado en `##` y `###`. El texto antes del primer `##` se descarta (título `#`). */
export function partirSecciones(cuerpo: string): Pick<Documento, "secciones" | "subsecciones"> {
  const secciones: Record<string, string> = {};
  const subsecciones: Record<string, Record<string, string>> = {};
  let actual: string | null = null;
  let buffer: string[] = [];

  const cerrar = () => {
    if (actual === null) return;
    const texto = buffer.join("\n").trim();
    const partes = texto.split(/^### (.+)$/m);
    if (partes.length > 1) {
      // partes = [antes, clave1, texto1, clave2, texto2, …]
      secciones[actual] = partes[0].trim();
      subsecciones[actual] = {};
      for (let i = 1; i < partes.length; i += 2) subsecciones[actual][partes[i].trim()] = (partes[i + 1] ?? "").trim();
    } else {
      secciones[actual] = texto;
    }
  };

  for (const linea of cuerpo.split("\n")) {
    const h2 = /^## (.+)$/.exec(linea);
    if (h2) {
      cerrar();
      actual = h2[1].trim();
      buffer = [];
    } else if (actual !== null) {
      buffer.push(linea);
    }
  }
  cerrar();
  return { secciones, subsecciones };
}

export function parsearDocumento(texto: string, genero: Genero, valores: Valores, ruta: string): Documento {
  const { meta, cuerpo } = separarFrontmatter(texto);
  const renderizado = renderizarPlantilla(cuerpo, genero, valores, ruta);
  return { ruta, meta, ...partirSecciones(renderizado) };
}

export interface OpcionesContenido {
  /** Si falta un archivo, usa texto de prueba en vez de fallar (solo muestras y pruebas de maqueta). */
  relleno?: (ruta: string) => string | null;
}

export class ContenidoFaltante extends Error {
  constructor(ruta: string) {
    super(`Falta content/oraculo/${ruta}.`);
    this.name = "ContenidoFaltante";
  }
}

export class Contenido {
  private cache = new Map<string, Documento | null>();
  /** Rutas que se sirvieron con texto de relleno (para avisar en la muestra). */
  readonly rellenadas = new Set<string>();

  constructor(
    private fuente: FuenteContenido,
    readonly genero: Genero,
    private valores: Valores,
    private opciones: OpcionesContenido = {}
  ) {}

  /** Documento o null si no existe (y no hay relleno). */
  opcional(ruta: string): Documento | null {
    if (this.cache.has(ruta)) return this.cache.get(ruta) ?? null;
    let texto = this.fuente.leer(ruta);
    if (texto === null && this.opciones.relleno) {
      texto = this.opciones.relleno(ruta);
      if (texto !== null) this.rellenadas.add(ruta);
    }
    const doc = texto === null ? null : parsearDocumento(texto, this.genero, this.valores, ruta);
    this.cache.set(ruta, doc);
    return doc;
  }

  requerir(ruta: string): Documento {
    const d = this.opcional(ruta);
    if (!d) throw new ContenidoFaltante(ruta);
    return d;
  }

  nahual(slug: string): Documento {
    return this.requerir(`nahual/${slug}.md`);
  }

  tono(numero: number): Documento {
    return this.requerir(`tono/${numero}.md`);
  }

  /** Las 9 posiciones de la cruz, por `clave` (origen-concepcion, nacimiento, …). */
  posiciones(): Record<string, Documento> {
    const porClave: Record<string, Documento> = {};
    for (let n = 1; n <= 9; n++) {
      const d = this.requerir(`posicion/${n}.md`);
      porClave[d.meta.clave ?? String(n)] = d;
    }
    return porClave;
  }

  universal(): Documento | null {
    return this.opcional("universal.md");
  }

  /** Todo documento cargado hasta ahora (para revisar su estado de aprobación). */
  cargados(): Documento[] {
    return [...this.cache.values()].filter((d): d is Documento => d !== null);
  }

  /** Archivos usados que Azul aún no aprobó (`revision` distinta de «aprobada»). */
  sinAprobar(): string[] {
    return this.cargados()
      .filter((d) => d.meta.revision !== "aprobada")
      .map((d) => d.ruta);
  }
}

export { ErrorPlantilla };
