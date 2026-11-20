import { describe, it, expect } from "vitest";
import { MAICES, getMaizInfo, atributosCanon } from "../maices";
import { nahualToSlug } from "../nahualSlugs";

describe("canon de maíces", () => {
  it("cubre los 20 nahuales exactamente una vez", () => {
    const todos = MAICES.flatMap((m) => [...m.nahuales]);
    expect(todos).toHaveLength(20);
    expect(new Set(todos).size).toBe(20);
    expect([...todos].sort()).toEqual(Object.keys(nahualToSlug).sort());
  });

  it("asigna elemento por maíz", () => {
    expect(getMaizInfo("Imox")).toMatchObject({ color: "Rojo", elemento: "Agua" });
    expect(getMaizInfo("Kame")).toMatchObject({ color: "Blanco", elemento: "Aire" });
    expect(getMaizInfo("Aq'ab'al")).toMatchObject({ color: "Negro", elemento: "Tierra", direccion: "Oeste", confirmada: true });
    expect(getMaizInfo("Ajpu")).toMatchObject({ color: "Amarillo", elemento: "Fuego" });
  });

  it("los colores giran de cuatro en cuatro desde Imox", () => {
    const orden = ["Rojo", "Blanco", "Negro", "Amarillo"];
    const nombres = Object.keys(nahualToSlug); // en orden de la cuenta
    nombres.forEach((n, i) => expect(getMaizInfo(n)?.color).toBe(orden[i % 4]));
  });

  it("sobrescribe lo que traiga la BD", () => {
    const n = atributosCanon({ nombre: "Kan", elemento: "Fuego", color_maiz: "Rojo", punto_cardinal: "Este" });
    expect(n.elemento).toBe("Agua");
  });

  it("deja intacto un nahual desconocido", () => {
    const n = { nombre: "X", elemento: "Luz", color_maiz: "Azul", punto_cardinal: "Centro" };
    expect(atributosCanon(n)).toEqual(n);
  });
});
