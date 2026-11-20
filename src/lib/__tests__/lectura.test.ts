import { describe, it, expect } from "vitest";
import { primeraFrase, contarPalabras, enumerar, introNahual, introKin, LLAMADO_CALCULAR } from "../lectura";
import { getResumenConocimiento, nahualConocimientoExpandido } from "@/data/mayanKnowledge";
import { NAHUALES_SEED, TONOS_SEED } from "@/test/seed";

describe("lectura: utilidades", () => {
  it("primeraFrase corta en la primera oración", () => {
    expect(primeraFrase("La unidad, el principio de todo. Representa nuevos comienzos.")).toBe("La unidad, el principio de todo.");
    expect(primeraFrase("Sin punto final")).toBe("Sin punto final");
    expect(primeraFrase(null)).toBe("");
  });

  it("contarPalabras ignora signos sueltos", () => {
    expect(contarPalabras("Glifo Murciélago · Elemento Tierra")).toBe(4);
  });

  it("enumerar une con «y»", () => {
    expect(enumerar(["a", "b", "c"])).toBe("a, b y c");
    expect(enumerar(["a"])).toBe("a");
  });
});

describe("resumen de conocimiento profundo (se abre con contacto)", () => {
  it("existe para los 20 nahuales y sale recortado del contenido existente", () => {
    for (const [nombre, c] of Object.entries(nahualConocimientoExpandido)) {
      const r = getResumenConocimiento(nombre)!;
      expect(r.significado).toBe(c.significadoProfundo);
      expect(r.naturaleza).toBe(c.relacionConNaturaleza);
      expect(r.mensaje).toBe(c.mensajeEspiritual);
      expect(r.luz).toEqual(c.polaridadPositiva);
      const palabras = contarPalabras([r.significado, r.naturaleza, r.mensaje, ...r.luz].join(" "));
      expect(palabras).toBeLessThanOrEqual(180);
    }
  });

  it("no incluye la parte extensa (ceremonias, trabajo espiritual, fecundación, aspectos a trabajar)", () => {
    for (const [nombre, c] of Object.entries(nahualConocimientoExpandido)) {
      const texto = JSON.stringify(getResumenConocimiento(nombre));
      expect(texto).not.toContain(c.ceremoniasYRituales);
      expect(texto).not.toContain(c.trabajoEspiritual);
      for (const sombra of c.polaridadNegativa) expect(texto).not.toContain(sombra);
    }
  });
});

describe("introducciones públicas", () => {
  it("el seed trae los 20 nahuales y los 13 tonos", () => {
    expect(NAHUALES_SEED).toHaveLength(20);
    expect(TONOS_SEED).toHaveLength(13);
  });

  it("/nahual: introducción y llamado entre ≈100 y 250 palabras", () => {
    for (const n of NAHUALES_SEED) {
      const p = contarPalabras([...introNahual(n), LLAMADO_CALCULAR].join(" "));
      expect(p, n.nombre).toBeGreaterThanOrEqual(100);
      expect(p, n.nombre).toBeLessThanOrEqual(250);
    }
  });

  it("/kin: introducción entre 150 y 250 palabras para los 260 kines", () => {
    for (const t of TONOS_SEED) {
      for (const n of NAHUALES_SEED) {
        const i = introKin(n, t, 1);
        const p = contarPalabras([i.combinacion, i.nahual, i.tono, i.nacimiento].join(" "));
        expect(p, `${t.numero} ${n.nombre}`).toBeGreaterThanOrEqual(150);
        expect(p, `${t.numero} ${n.nombre}`).toBeLessThanOrEqual(250);
      }
    }
  });
});
