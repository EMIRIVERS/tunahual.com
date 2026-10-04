import { describe, it, expect } from "vitest";
import { cargadorPorFecha, CARGADORES_INDEX } from "../cargador";

const NOMBRE: Record<number, string> = { 2: "Iq'", 7: "Kej", 12: "E", 17: "No'j" };
const f = (y: number, m: number, d: number) => new Date(y, m - 1, d);

describe("cargador del año", () => {
  it("2026 (desde 18 feb) = 1 Kej, año 5141", () => {
    const c = cargadorPorFecha(f(2026, 10, 3));
    expect([c.tono, NOMBRE[c.nahualIndex], c.anio]).toEqual([1, "Kej", 5141]);
    expect(c.inicio).toEqual(f(2026, 2, 18));
  });
  it("antes del 18 feb 2026 pertenece al año anterior: 13 Iq', 5140", () => {
    const c = cargadorPorFecha(f(2026, 2, 17));
    expect([c.tono, NOMBRE[c.nahualIndex], c.anio]).toEqual([13, "Iq'", 5140]);
  });
  it("2027 = 2 E (5142) y 2028 = 3 No'j (5143)", () => {
    const a = cargadorPorFecha(f(2027, 6, 1));
    expect([a.tono, NOMBRE[a.nahualIndex], a.anio]).toEqual([2, "E", 5142]);
    const b = cargadorPorFecha(f(2028, 6, 1));
    expect([b.tono, NOMBRE[b.nahualIndex], b.anio]).toEqual([3, "No'j", 5143]);
  });
  it("siempre es uno de los cuatro cargadores, incluso en 1990", () => {
    for (let y = 1900; y <= 2100; y += 7) {
      expect(CARGADORES_INDEX).toContain(cargadorPorFecha(f(y, 5, 5)).nahualIndex);
    }
  });
});
