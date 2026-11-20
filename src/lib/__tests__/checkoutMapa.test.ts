import { describe, it, expect, vi, afterEach } from "vitest";
import { crearCheckoutMapa, fechaISOLocal } from "../checkoutMapa";

const datos = { kinSlug: "7-aqabal", nahualSlug: "aqabal", tono: 7, nahual: "Aq'ab'al", fechaNacimiento: "1990-03-15", nombre: "Ana", genero: "neutro" as const };

afterEach(() => vi.unstubAllGlobals());

describe("checkoutMapa", () => {
  it("fechaISOLocal usa los componentes locales, no UTC", () => {
    expect(fechaISOLocal(new Date(1990, 2, 5))).toBe("1990-03-05");
  });

  it("devuelve la url de Stripe y manda nombre y género", async () => {
    const f = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ url: "https://checkout.stripe.com/x" }) });
    vi.stubGlobal("fetch", f);
    expect(await crearCheckoutMapa(datos)).toBe("https://checkout.stripe.com/x");
    expect(JSON.parse(f.mock.calls[0][1].body)).toMatchObject({ nombre: "Ana", genero: "neutro", fecha_nacimiento: "1990-03-15" });
  });

  it("503 da un mensaje claro y otros fallos uno genérico", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({ error: "x" }) }));
    await expect(crearCheckoutMapa(datos)).rejects.toThrow(/aún no está disponible/);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 502, json: async () => ({}) }));
    await expect(crearCheckoutMapa(datos)).rejects.toThrow(/No se pudo iniciar/);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("red")));
    await expect(crearCheckoutMapa(datos)).rejects.toThrow(/conectar/);
  });
});
