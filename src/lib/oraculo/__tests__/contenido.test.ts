import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Contenido, fuenteEnMemoria, fuenteDeDisco, separarFrontmatter, partirSecciones, ContenidoFaltante } from "../contenido";
import { relleno, CLAVES_POSICION } from "../fixtures";
import { NOMBRES_NAHUAL } from "../calculo";
import { nahualToSlug } from "../../../data/nahualSlugs";
import { GENEROS } from "../genero";
import { TOKENS } from "../plantilla";

const valores = { nombre: "Persona Ficticia", fecha_compra: "4 de octubre de 2026", kin_compra: "8 Ix", nahual_compra: "I'x", tono_compra: "8", trecena_compra: "Q'anil" };

describe("contenido: partir documentos", () => {
  it("frontmatter con y sin comillas", () => {
    const { meta, cuerpo } = separarFrontmatter('---\nslug: kej\nnombre: "Jun"\n---\n\n## esencia\n\nTexto');
    expect(meta).toEqual({ slug: "kej", nombre: "Jun" });
    expect(cuerpo).toContain("## esencia");
  });

  it("secciones y subsecciones", () => {
    const { secciones, subsecciones } = partirSecciones("# T\n\n## a\n\nuno\n\n## b\n\nintro\n\n### x\n\ndos\n\n### y\n\ntres");
    expect(secciones.a).toBe("uno");
    expect(secciones.b).toBe("intro");
    expect(subsecciones.b).toEqual({ x: "dos", y: "tres" });
  });

  it("un bloque solo-mujer puede envolver un «## título»: se ve solo para mujer", () => {
    const md = "## cuerpo\n\nhola\n\n<!--solo:mujer-->\n## cuerpo-mujer\n\nciclo\n<!--/solo-->\n";
    const f = fuenteEnMemoria({ "nahual/x.md": md });
    expect(Object.keys(new Contenido(f, "mujer", valores).nahual("x").secciones)).toEqual(["cuerpo", "cuerpo-mujer"]);
    expect(Object.keys(new Contenido(f, "hombre", valores).nahual("x").secciones)).toEqual(["cuerpo"]);
    expect(Object.keys(new Contenido(f, "neutro", valores).nahual("x").secciones)).toEqual(["cuerpo"]);
  });

  it("archivo faltante: error claro; con relleno usa texto de prueba y lo anota", () => {
    const vacio = fuenteEnMemoria({});
    expect(() => new Contenido(vacio, "mujer", valores).nahual("kej")).toThrow(ContenidoFaltante);
    const c = new Contenido(vacio, "mujer", valores, { relleno });
    expect(c.nahual("kej").secciones.esencia).toContain("Texto de prueba");
    expect([...c.rellenadas]).toEqual(["nahual/kej.md"]);
  });

  it("token sin valor dentro de un documento: el error nombra el archivo", () => {
    const f = fuenteEnMemoria({ "tono/1.md": "## esencia\n\nHola {{nombre}}" });
    const sinNombre = { ...valores, nombre: undefined };
    expect(() => new Contenido(f, "mujer", sinNombre).tono(1)).toThrow(/tono\/1\.md/);
  });

  it("sinAprobar lista lo que no tiene revision: aprobada", () => {
    const c = new Contenido(fuenteEnMemoria({}), "neutro", valores, { relleno });
    c.nahual("kej");
    c.tono(3);
    expect(c.sinAprobar()).toEqual(["nahual/kej.md", "tono/3.md"]);
  });

  it("posiciones() indexa las 9 por clave", () => {
    const c = new Contenido(fuenteEnMemoria({}), "neutro", valores, { relleno });
    expect(Object.keys(c.posiciones())).toEqual(CLAVES_POSICION.map((p) => p[0]));
  });
});

// Valida el contenido REAL que están redactando los agentes: cada archivo debe renderizar
// con los tres géneros y sin marcadores sobrantes. Se omite si todavía no existe.
const RAIZ = resolve(__dirname, "../../../../content/oraculo");
describe.skipIf(!existsSync(RAIZ))("contenido real de content/oraculo", () => {
  const fuente = fuenteDeDisco(RAIZ);

  it.each(GENEROS)("los 20 nahuales, 13 tonos y 9 posiciones renderizan para %s", (genero) => {
    const c = new Contenido(fuente, genero, valores);
    const problemas: string[] = [];
    const intenta = (f: () => unknown, que: string) => {
      try {
        f();
      } catch (e) {
        problemas.push(`${que}: ${(e as Error).message}`);
      }
    };
    for (const n of NOMBRES_NAHUAL) intenta(() => c.nahual(nahualToSlug[n]), n);
    for (let t = 1; t <= 13; t++) intenta(() => c.tono(t), `tono ${t}`);
    intenta(() => c.posiciones(), "posiciones");
    expect(problemas).toEqual([]);
  });

  it("los tokens que usa el contenido son todos conocidos", () => {
    const desconocidos = new Set<string>();
    for (const carpeta of ["nahual", "tono", "posicion"]) {
      const n = carpeta === "nahual" ? NOMBRES_NAHUAL.map((x) => nahualToSlug[x]) : Array.from({ length: carpeta === "tono" ? 13 : 9 }, (_, i) => String(i + 1));
      for (const id of n) {
        const t = fuente.leer(`${carpeta}/${id}.md`);
        if (!t) continue;
        for (const m of t.matchAll(/\{\{([^{}|]*)\}\}/g)) if (!(TOKENS as readonly string[]).includes(m[1].trim())) desconocidos.add(m[1].trim());
      }
    }
    expect([...desconocidos]).toEqual([]);
  });

  it("ningún texto nombra a la persona del PDF original ni sus datos", () => {
    // «victoria» sola es una palabra común (Ajpu); lo prohibido es el nombre de la persona y sus datos.
    const prohibidas = [/victoria bustos/i, /bustos/i, /\bVictoria,/, /notari[ao]/i, /guitarrista/i];
    const hallazgos: string[] = [];
    for (const carpeta of ["nahual", "tono", "posicion"]) {
      const ids = carpeta === "nahual" ? Object.values(nahualToSlug) : Array.from({ length: carpeta === "tono" ? 13 : 9 }, (_, i) => String(i + 1));
      for (const id of ids) {
        const t = readFileSyncSafe(`${RAIZ}/${carpeta}/${id}.md`);
        for (const re of prohibidas) if (re.test(t)) hallazgos.push(`${carpeta}/${id}.md ${re}`);
      }
    }
    expect(hallazgos).toEqual([]);
  });
});

function readFileSyncSafe(ruta: string): string {
  return existsSync(ruta) ? readFileSync(ruta, "utf8") : "";
}
