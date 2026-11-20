import { describe, it, expect } from "vitest";
import { cruzOraculo, kinDeFecha, energiaDelDia, analizarCruz, tablaTrecena, fechaLarga, fechaISOEnZona, fechaDesdeISO, trecenaDeFecha } from "../calculo";

// 25-mar-2027 = 11 Kej: el kin del Oráculo de referencia (la cruz salió del PDF original,
// comprobada a mano contra los desplazamientos −8/+8 y ±6 de mayanCalculations.ts).
const KEJ_11 = "2027-03-25";

describe("kin y trecena", () => {
  it("las anclas del repo: 3-oct-2026 = 7 I'x y 25-mar-2027 = 11 Kej", () => {
    expect(kinDeFecha("2026-10-03").etiqueta).toBe("7 I'x");
    expect(kinDeFecha(KEJ_11).etiqueta).toBe("11 Kej");
    expect(kinDeFecha("2002-08-08").etiqueta).toBe("12 E"); // ancla
  });

  it("trecena de 11 Kej = No'j; la de 7 I'x = Q'anil", () => {
    expect(trecenaDeFecha(KEJ_11)).toBe("No'j");
    expect(trecenaDeFecha("2026-10-03")).toBe("Q'anil");
  });

  it("fecha inválida o inexistente: error claro", () => {
    expect(() => fechaDesdeISO("14/05/1990")).toThrow(/YYYY-MM-DD/);
    expect(() => fechaDesdeISO("2027-02-30")).toThrow(/inexistente/);
  });
});

describe("cruz de nueve (verificada con 11 Kej)", () => {
  const cruz = cruzOraculo(KEJ_11);
  const por = (p: string) => cruz.celdas.find((c) => c.posicion === p)!.etiqueta;

  it("coincide con el diagrama del PDF original", () => {
    expect(cruz.nacimiento.etiqueta).toBe("11 Kej");
    expect(cruz.trecena).toBe("No'j");
    // fila de arriba: 10 Aj | 3 Kawoq | 9 Kan
    expect([por("origen-poder"), por("origen-concepcion"), por("origen-esencia")]).toEqual(["10 Aj", "3 Kawoq", "9 Kan"]);
    // fila de en medio: 5 Imox | 11 Kej | 4 Aj
    expect([por("mano-derecha"), por("nacimiento"), por("mano-izquierda")]).toEqual(["5 Imox", "11 Kej", "4 Aj"]);
    // fila de abajo: 13 Toj | 6 Tz'ikin | 12 Imox
    expect([por("destino-poder"), por("destino-52"), por("destino-esencia")]).toEqual(["13 Toj", "6 Tz'ikin", "12 Imox"]);
  });

  it("el orden de lectura es fila a fila y cada celda trae fila y columna", () => {
    expect(cruz.celdas.map((c) => [c.fila, c.columna])).toEqual([[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]]);
  });

  it("lecturas calculadas: canal negro, lados rojos, Aj e Imox repetidos", () => {
    const a = analizarCruz(cruz);
    expect(a.canalUnico?.color).toBe("Negro");
    expect(a.ladosUnico?.color).toBe("Rojo");
    expect(a.repetidos.map((r) => r.nahual).sort()).toEqual(["Aj", "Imox"]);
    expect(a.repetidos.find((r) => r.nahual === "Aj")?.posiciones).toEqual(["origen-poder", "mano-izquierda"]);
    expect(a.repetidos.find((r) => r.nahual === "Imox")?.posiciones).toEqual(["mano-derecha", "destino-esencia"]);
  });

  it("cinco nahuales viven dentro de la trecena de No'j y todos en días impares (3, 5, 9, 11, 13)", () => {
    const a = analizarCruz(cruz);
    expect(a.enTuTrecena.map((c) => c.etiqueta)).toEqual(["3 Kawoq", "9 Kan", "5 Imox", "11 Kej", "13 Toj"]);
    expect(a.todasImpares).toBe(true);
  });

  it("tabla de la trecena: 13 días desde No'j, con tu día y las marcas", () => {
    const t = tablaTrecena(cruz);
    expect(t).toHaveLength(13);
    expect(t[0]).toMatchObject({ dia: 1, nahual: "No'j" });
    expect(t.map((d) => d.nahual).join(",")).toBe("No'j,Tijax,Kawoq,Ajpu,Imox,Iq',Aq'ab'al,K'at,Kan,Kame,Kej,Q'anil,Toj");
    expect(t.filter((d) => d.esTuDia).map((d) => d.dia)).toEqual([11]);
    expect(t.filter((d) => d.marcas.length).map((d) => d.dia)).toEqual([3, 5, 9, 11, 13]);
  });
});

describe("energía del día de compra", () => {
  it("kin, nahual, tono, trecena y fecha en texto", () => {
    const e = energiaDelDia("2026-10-03");
    expect(e).toMatchObject({ etiqueta: "7 I'x", nahual: "I'x", tono: 7, trecena: "Q'anil", fechaTexto: "3 de octubre de 2026" });
  });

  it("fechaLarga y fecha en zona horaria del negocio", () => {
    expect(fechaLarga("2027-03-05")).toBe("5 de marzo de 2027");
    // 2026-10-05 03:30 UTC sigue siendo 4-oct en Ciudad de México (UTC-6)
    expect(fechaISOEnZona(Date.UTC(2026, 9, 5, 3, 30) / 1000)).toBe("2026-10-04");
    expect(fechaISOEnZona(Date.UTC(2026, 9, 5, 7, 0) / 1000)).toBe("2026-10-05");
  });

  it("los 260 días dan 260 kines distintos sin error", () => {
    const vistos = new Set<number>();
    const base = new Date(2026, 0, 1, 12);
    for (let i = 0; i < 260; i++) {
      const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i, 12);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      vistos.add(kinDeFecha(iso).kin);
    }
    expect(vistos.size).toBe(260);
  });
});
