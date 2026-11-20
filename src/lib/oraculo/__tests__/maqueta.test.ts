import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { construirOraculo, valoresDe, limpiarNombre, primeraFrase, sinVocativo, tamanoNombrePortada, ErrorDatos, type DatosOraculo } from "../maqueta";
import { Contenido, fuenteDeDisco, fuenteEnMemoria } from "../contenido";
import { relleno } from "../fixtures";
import { GENEROS, type Genero } from "../genero";

/** El <body>: el CSS lleva llaves legítimas que no son marcadores. */
const cuerpoDe = (html: string) => html.slice(html.indexOf("<body>"));

const datos = (genero: Genero, extra: Partial<DatosOraculo> = {}): DatosOraculo => ({
  nombre: "Persona Ficticia",
  fechaNacimiento: "1990-05-14",
  genero,
  fechaCompra: "2026-10-04",
  ...extra,
});

/** Contenido de prueba (texto de relleno) para no depender de que content/ esté completo. */
const conRelleno = (d: DatosOraculo) => new Contenido(fuenteEnMemoria({}), d.genero, valoresDe(d), { relleno });

describe("maqueta: datos", () => {
  it("valoresDe sigue el ESQUEMA: kin_compra es el número 1–260", () => {
    // 4-oct-2026 = 8 Tz'ikin = kin 155, trecena de Q'anil
    expect(valoresDe(datos("mujer"))).toEqual({
      nombre: "Persona Ficticia",
      fecha_compra: "4 de octubre de 2026",
      kin_compra: "155",
      nahual_compra: "Tz'ikin",
      tono_compra: "8",
      trecena_compra: "Q'anil",
    });
  });

  it("limpiarNombre: espacios, control y largo; rechaza nombres vacíos", () => {
    expect(limpiarNombre("  Ana \n\t María  ")).toBe("Ana María");
    expect(limpiarNombre("x".repeat(300)).length).toBe(100);
    expect(() => limpiarNombre("  ")).toThrow(ErrorDatos);
    expect(() => limpiarNombre("1")).toThrow(/2 letras/);
    expect(limpiarNombre("Zoë D'Ávila-Núñez")).toBe("Zoë D'Ávila-Núñez");
  });

  it("el tamaño del nombre en portada baja con el largo", () => {
    expect([10, 30, 50, 100].map((n) => tamanoNombrePortada("x".repeat(n)))).toEqual([23.5, 19, 15.5, 12.5]);
  });

  it("primeraFrase corta en la primera oración", () => {
    expect(primeraFrase("Imox es el agua. La que corre por los ríos.\n\nOtro párrafo.")).toBe("Imox es el agua.");
    expect(primeraFrase("Sin punto final")).toBe("Sin punto final");
  });

  it("sinVocativo quita el «Nombre, » inicial de la tabla de la trecena", () => {
    expect(sinVocativo("Ana Ruiz, imox es el agua.", "Ana Ruiz")).toBe("Imox es el agua.");
    expect(sinVocativo("Imox es el agua.", "Ana Ruiz")).toBe("Imox es el agua.");
  });
});

describe("maqueta: HTML", () => {
  it("arma las páginas del esquema con texto de prueba, sin marcadores ni datos de otra persona", () => {
    const d = datos("neutro");
    const r = construirOraculo(d, conRelleno(d));
    expect((r.html.match(/<section class="oscura/g) ?? []).length).toBe(2); // portada y cierre
    expect(r.kin).toBe("2 Aq'ab'al");
    expect(r.trecena).toBe("Iq'");
    expect(cuerpoDe(r.html)).not.toMatch(/\{\{|\}\}|<!--/);
    expect(r.html).not.toMatch(/victoria|bustos/i);
    // la cruz trae sus nueve celdas
    expect((r.html.match(/class="celda/g) ?? []).length).toBe(9);
    expect(r.rellenadas.length).toBeGreaterThan(20);
  });

  it("el nombre se escapa: no puede inyectar HTML ni salir del pie de página", () => {
    const d = datos("mujer", { nombre: `</style><script>alert(1)</script> "Ana"` });
    const r = construirOraculo(d, conRelleno(d));
    expect(r.html).not.toContain("<script>");
    expect(r.html).toContain("&lt;script&gt;");
    // en el CSS del pie las comillas van escapadas
    expect(r.html).toMatch(/content:"[^"\n]*(\\")?/);
    expect(r.html.split("</style>").length).toBe(2); // un solo cierre de <style>: el del documento
  });

  it("nombre largo: el pie se trunca con elipsis y la portada lo conserva completo", () => {
    const largo = "María Guadalupe de los Ángeles Fernández Hernández";
    const d = datos("mujer", { nombre: largo });
    const r = construirOraculo(d, conRelleno(d));
    expect(r.pieDePagina).toContain("…");
    expect(r.html).toMatch(new RegExp(`<div class="centrado nom" style="font-size:15.5pt">${largo}</div>`));
  });

  it("marca borrador en el pie mientras haya texto sin aprobar", () => {
    const d = datos("hombre");
    expect(construirOraculo(d, conRelleno(d)).html).toContain('content:"borrador"');
    expect(construirOraculo(d, conRelleno(d), { marcaBorrador: false }).html).not.toContain('content:"borrador"');
  });

  it("falta contenido de un nahual: error claro, no un PDF a medias", () => {
    const d = datos("mujer");
    const vacio = new Contenido(fuenteEnMemoria({}), "mujer", valoresDe(d));
    expect(() => construirOraculo(d, vacio)).toThrow(/Falta content\/oraculo\//);
  });
});

// Con el contenido REAL: lo solo-mujer no debe llegar a hombres ni a neutro, y viceversa.
const RAIZ = resolve(__dirname, "../../../../content/oraculo");
describe.skipIf(!existsSync(RAIZ))("maqueta con el contenido real", () => {
  const html = (g: Genero) => {
    const d = datos(g);
    return construirOraculo(d, new Contenido(fuenteDeDisco(RAIZ), g, valoresDe(d))).html;
  };
  const textos = Object.fromEntries(GENEROS.map((g) => [g, html(g)])) as Record<Genero, string>;

  it.each(GENEROS)("sin marcadores sobrantes (%s)", (g) => {
    expect(cuerpoDe(textos[g])).not.toMatch(/\{\{|\}\}|<!--\s*\/?solo/);
  });

  it("el contenido de útero y cérvix aparece SOLO para mujer", () => {
    const intimo = /útero|cérvix/i;
    expect(textos.mujer).toMatch(intimo);
    expect(textos.hombre).not.toMatch(intimo);
    expect(textos.neutro).not.toMatch(intimo);
    expect(textos.mujer).toContain("Tu ciclo");
    expect(textos.hombre).not.toContain("Tu ciclo");
  });

  it("las variantes de género cambian el texto entre mujer, hombre y neutro", () => {
    // «Y tú no eres obrera|obrero|…» está en universal#cholqij
    expect(textos.mujer).toContain("Y tú no eres obrera");
    expect(textos.hombre).toContain("Y tú no eres obrero");
    expect(textos.neutro).toContain("Y tú no naciste para ser engrane");
    expect(textos.hombre).not.toContain("obrera");
  });

  it("la fecha de compra aparece y no hay lenguaje de «sesión»", () => {
    for (const g of GENEROS) {
      expect(textos[g]).toContain("4 de octubre de 2026");
      expect(textos[g]).not.toMatch(/sesión|sesion/i);
    }
  });
});
