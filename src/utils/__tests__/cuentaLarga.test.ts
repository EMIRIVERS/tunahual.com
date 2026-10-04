import { describe, it, expect } from "vitest";
import { calcularCuentaLarga, calcularHaab } from "../cuentaLarga";

const f = (y: number, m: number, d: number) => new Date(y, m - 1, d);

describe("Cuenta Larga (GMT 584283)", () => {
  it("3 oct 2026 = 13.0.13.17.14", () => {
    expect(calcularCuentaLarga(f(2026, 10, 3)).texto).toBe("13.0.13.17.14");
  });
  it("14 sep 2026 = 13.0.13.16.15", () => {
    expect(calcularCuentaLarga(f(2026, 9, 14)).texto).toBe("13.0.13.16.15");
  });
  it("15 mar 1990 = 12.18.16.16.3", () => {
    expect(calcularCuentaLarga(f(1990, 3, 15)).texto).toBe("12.18.16.16.3");
  });
  it("21 dic 2012 = 13.0.0.0.0", () => {
    expect(calcularCuentaLarga(f(2012, 12, 21)).texto).toBe("13.0.0.0.0");
  });
});

describe("Haab'", () => {
  it("3 oct 2026 = 7 Yax", () => expect(calcularHaab(f(2026, 10, 3)).texto).toBe("7 Yax"));
  it("14 sep 2026 = 8 Ch'en", () => expect(calcularHaab(f(2026, 9, 14)).texto).toBe("8 Ch'en"));
  it("15 mar 1990 = 1 Kumk'u", () => expect(calcularHaab(f(1990, 3, 15)).texto).toBe("1 Kumk'u"));
});
