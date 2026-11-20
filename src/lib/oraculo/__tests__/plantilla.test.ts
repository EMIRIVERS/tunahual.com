import { describe, it, expect } from "vitest";
import { renderizarPlantilla, tokensUsados, ErrorPlantilla, TOKENS } from "../plantilla";
import type { Genero } from "../genero";

const valores = {
  nombre: "Persona Ficticia",
  fecha_compra: "4 de octubre de 2026",
  kin_compra: "8 Ix",
  nahual_compra: "I'x",
  tono_compra: "8",
  trecena_compra: "Q'anil",
};

const r = (t: string, g: Genero, v = valores) => renderizarPlantilla(t, g, v, "prueba.md");

describe("plantilla: tokens", () => {
  it("sustituye todos los tokens", () => {
    const t = TOKENS.map((k) => `{{${k}}}`).join(" · ");
    expect(r(t, "mujer")).toBe("Persona Ficticia · 4 de octubre de 2026 · 8 Ix · I'x · 8 · Q'anil");
  });

  it("tolera espacios dentro de las llaves", () => {
    expect(r("Hola {{ nombre }}", "neutro")).toBe("Hola Persona Ficticia");
  });

  it("token sin valor: error claro con archivo y línea", () => {
    const { nombre: _omitido, ...sinNombre } = valores;
    expect(() => r("uno\ndos {{nombre}}", "mujer", sinNombre)).toThrowError(/Falta el valor del token «\{\{nombre\}\}».*prueba\.md:2/);
    expect(() => r("{{nombre}}", "mujer", { ...valores, nombre: "" })).toThrow(ErrorPlantilla);
  });

  it("token desconocido: error que lista los válidos", () => {
    expect(() => r("{{apellido}}", "hombre")).toThrowError(/Token desconocido «\{\{apellido\}\}».*nombre/);
  });

  it("marcador ilegible", () => {
    expect(() => r("{{Nombre completo}}", "mujer")).toThrow(/ilegible/);
  });
});

describe("plantilla: género", () => {
  const t = "{{Soy la elegida|Soy el elegido|Soy lo elegido}}, {{lista|listo|con todo listo}}.";

  it.each([
    ["mujer", "Soy la elegida, lista."],
    ["hombre", "Soy el elegido, listo."],
    ["neutro", "Soy lo elegido, con todo listo."],
  ] as const)("variante para %s", (g, esperado) => {
    expect(r(t, g)).toBe(esperado);
  });

  it("admite variantes vacías", () => {
    expect(r("Eres {{la|el|}}mejor", "neutro")).toBe("Eres mejor");
    expect(r("Eres {{la|el|}}mejor", "mujer")).toBe("Eres lamejor");
  });

  it("variantes con número incorrecto de opciones: error", () => {
    expect(() => r("{{a|b}}", "mujer")).toThrow(/2 opciones.*deben ser 3/);
    expect(() => r("{{a|b|c|d}}", "mujer")).toThrow(/4 opciones/);
  });

  it("género inválido: error", () => {
    expect(() => r("x", "otro" as Genero)).toThrow(/Género inválido/);
  });
});

describe("plantilla: bloque solo mujer", () => {
  const t = ["Antes.", "", "<!--solo:mujer-->", "Tu útero guarda memoria.", "<!--/solo-->", "", "Después."].join("\n");

  it("se ve para mujer", () => {
    const s = r(t, "mujer");
    expect(s).toContain("Tu útero guarda memoria.");
    expect(s).not.toContain("<!--");
  });

  it.each(["hombre", "neutro"] as const)("se oculta para %s sin dejar huecos ni restos", (g) => {
    const s = r(t, g);
    expect(s).not.toContain("útero");
    expect(s).not.toContain("<!--");
    expect(s).toBe("Antes.\n\nDespués.");
  });

  it("varios bloques y tokens dentro del bloque", () => {
    const m = "A <!--solo:mujer-->{{nombre}}<!--/solo--> B <!--solo:mujer-->C<!--/solo--> D";
    expect(r(m, "mujer")).toBe("A Persona Ficticia B C D");
    expect(r(m, "hombre")).toBe("A  B  D");
  });

  it("un token faltante dentro de un bloque oculto NO falla (no se imprime)", () => {
    const { nombre: _o, ...sinNombre } = valores;
    expect(r("<!--solo:mujer-->{{nombre}}<!--/solo-->ok", "hombre", sinNombre)).toBe("ok");
  });

  it("bloque sin cerrar, cierre huérfano, destino desconocido y anidado: error", () => {
    expect(() => r("<!--solo:mujer-->sin cerrar", "mujer")).toThrow(/sin cerrar/);
    expect(() => r("huérfano <!--/solo-->", "mujer")).toThrow(/sin su apertura/);
    expect(() => r("<!--solo:nina-->x<!--/solo-->", "mujer")).toThrow(/desconocido/);
    expect(() => r("<!--solo:mujer-->a<!--solo:mujer-->b<!--/solo--><!--/solo-->", "mujer")).toThrow(/anidados/);
  });
});

describe("plantilla: salida limpia", () => {
  it("nunca deja «{{» ni «}}» sobrantes", () => {
    expect(() => r("texto con {{ suelta", "mujer")).toThrow(/sin resolver/);
    expect(() => r("texto con }} suelta", "mujer")).toThrow(/sin resolver/);
    for (const g of ["mujer", "hombre", "neutro"] as const) {
      const s = r("{{nombre}} {{a|b|c}} <!--solo:mujer-->x<!--/solo-->", g);
      expect(s).not.toMatch(/\{\{|\}\}|<!--/);
    }
  });

  it("tokensUsados lista tokens sin contar variantes de género", () => {
    expect(tokensUsados("{{nombre}} {{a|b|c}} {{ kin_compra }} {{nombre}}").sort()).toEqual(["kin_compra", "nombre"]);
  });
});

describe("plantilla: marcadores en líneas propias (listas)", () => {
  const lista = "1. Uno\n2. Dos\n<!--solo:mujer-->\n   Extra de mujer.\n<!--/solo-->\n3. Tres";
  it("para mujer conserva el extra sin renglones vacíos", () => {
    expect(r(lista, "mujer")).toBe("1. Uno\n2. Dos\n   Extra de mujer.\n3. Tres");
  });
  it("para hombre y neutro la lista queda contigua", () => {
    expect(r(lista, "hombre")).toBe("1. Uno\n2. Dos\n3. Tres");
    expect(r(lista, "neutro")).toBe("1. Uno\n2. Dos\n3. Tres");
  });
  it("un bloque que envuelve un «## título» no deja título huérfano", () => {
    const t = "intro\n\n<!--solo:mujer-->\n## cuerpo-mujer\n\nciclo\n<!--/solo-->\n";
    expect(r(t, "hombre")).toBe("intro\n\n");
    expect(r(t, "mujer")).toContain("## cuerpo-mujer");
  });
});
