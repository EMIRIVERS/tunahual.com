import { describe, it, expect } from "vitest";
import { calcularLuna, lunasEnRango } from "../luna";

describe("luna", () => {
  it("15 mar 1990: menguante gibosa, ~85%", () => {
    const l = calcularLuna(new Date(1990, 2, 15));
    expect(l.fase).toBe("gibosa-menguante");
    expect(l.iluminacion).toBeGreaterThanOrEqual(83);
    expect(l.iluminacion).toBeLessThanOrEqual(87);
  });
  it("3 oct 2026: cerca del cuarto menguante", () => {
    const l = calcularLuna(new Date(2026, 9, 3));
    expect(["cuarto-menguante", "gibosa-menguante", "menguante"]).toContain(l.fase);
    expect(l.iluminacion).toBeGreaterThan(25);
    expect(l.iluminacion).toBeLessThan(75);
  });
  it("luna llena del 26 sep 2026 (aprox) cae en un rango de 13 días", () => {
    const ev = lunasEnRango(new Date(2026, 8, 20), 13);
    expect(ev.some((e) => e.tipo === "llena")).toBe(true);
    ev.forEach((e) => { expect(e.dia).toBeGreaterThanOrEqual(1); expect(e.dia).toBeLessThanOrEqual(14); });
  });
});
