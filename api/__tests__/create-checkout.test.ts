import { describe, it, expect, vi } from "vitest";
import { createCheckoutSession, limpiarEntrada, PRECIO_MAPA_CENTAVOS, GENEROS } from "../create-checkout";

const valida = { kinSlug: "7-aqabal", nahualSlug: "aqabal", tono: 7, nahual: "Aq'ab'al", fecha_nacimiento: "1990-03-15", nombre: "Ana", genero: "neutro" };

const ON = { habilitado: true };

function stripeFalso(url: string | null = "https://checkout.stripe.com/c/pay/cs_test_x") {
  const create = vi.fn().mockResolvedValue({ id: "cs_test_x", url });
  return { create, stripe: { checkout: { sessions: { create } } } as never };
}

describe("create-checkout", () => {
  it("sin STRIPE_SECRET_KEY responde 503 y no llama a Stripe", async () => {
    const r = await createCheckoutSession(valida, { secretKey: undefined, habilitado: true });
    expect(r.status).toBe(503);
  });

  it("SEGURIDAD: sin el interruptor del servidor no se crea ninguna sesión, aunque haya llave y Stripe", async () => {
    const { create, stripe } = stripeFalso();
    for (const h of [undefined, false]) {
      const r = await createCheckoutSession(valida, { stripe, secretKey: "clave_falsa", habilitado: h as boolean | undefined });
      expect(r.status).toBe(503);
    }
    expect(create).not.toHaveBeenCalled();
  });

  it("la sesión sin pagar caduca en 30 minutos", async () => {
    const { create, stripe } = stripeFalso();
    await createCheckoutSession(valida, { stripe, ...ON });
    const antes = Math.floor(Date.now() / 1000);
    expect(create.mock.calls[0][0].expires_at).toBeGreaterThanOrEqual(antes + 30 * 60 - 5);
    expect(create.mock.calls[0][0].expires_at).toBeLessThanOrEqual(antes + 30 * 60 + 5);
  });

  it("rechaza entradas inválidas con 400", async () => {
    const { create, stripe } = stripeFalso();
    for (const mala of [
      {},
      { ...valida, kinSlug: "14-aqabal" },
      { ...valida, kinSlug: "7-aq'abal" },
      { ...valida, nahualSlug: "kej" }, // no coincide con el kin
      { ...valida, tono: 8 }, // no coincide con el kin
      { ...valida, fecha_nacimiento: "15/03/1990" },
      { ...valida, email: "no-es-correo" },
      { ...valida, genero: undefined },
      { ...valida, genero: "otro" },
      { ...valida, genero: "" },
    ]) {
      expect((await createCheckoutSession(mala, { stripe, ...ON })).status).toBe(400);
    }
    expect(create).not.toHaveBeenCalled();
  });

  it("crea la sesión de pago único con price_data de 11 USD si no hay STRIPE_PRICE_ID", async () => {
    const { create, stripe } = stripeFalso();
    const r = await createCheckoutSession({ ...valida, email: "ANA@mail.com" }, { stripe, ...ON });
    expect(r).toEqual({ status: 200, body: { url: "https://checkout.stripe.com/c/pay/cs_test_x" } });
    const p = create.mock.calls[0][0];
    expect(p.mode).toBe("payment");
    expect(p.line_items).toHaveLength(1);
    expect(p.line_items[0].price_data).toMatchObject({ currency: "usd", unit_amount: PRECIO_MAPA_CENTAVOS });
    expect(PRECIO_MAPA_CENTAVOS).toBe(1100);
    expect(p.customer_email).toBe("ana@mail.com");
    expect(p.metadata).toMatchObject({ producto: "mapa-energia", kin_slug: "7-aqabal", nahual_slug: "aqabal", tono: "7", fecha_nacimiento: "1990-03-15", genero: "neutro" });
    expect(p.success_url).toBe("https://www.tunahual.com/gracias?session_id={CHECKOUT_SESSION_ID}");
    expect(p.cancel_url).toBe("https://www.tunahual.com/resultado/7-aqabal");
  });

  it("usa STRIPE_PRICE_ID cuando existe y no pide correo si no se manda", async () => {
    const { create, stripe } = stripeFalso();
    await createCheckoutSession(valida, { stripe, priceId: "price_dummy", ...ON });
    const p = create.mock.calls[0][0];
    expect(p.line_items[0]).toEqual({ price: "price_dummy", quantity: 1 });
    expect(p.customer_email).toBeUndefined();
  });

  it("si Stripe falla o no devuelve url responde 502 sin filtrar el error", async () => {
    const logger = { error: vi.fn() };
    const boom = { checkout: { sessions: { create: vi.fn().mockRejectedValue(new Error("secreto interno")) } } } as never;
    const r1 = await createCheckoutSession(valida, { stripe: boom, logger, ...ON });
    expect(r1.status).toBe(502);
    expect(JSON.stringify(r1.body)).not.toContain("secreto");
    expect((await createCheckoutSession(valida, { stripe: stripeFalso(null).stripe, logger, ...ON })).status).toBe(502);
  });

  it("pasa el género validado a la metadata, en minúsculas", async () => {
    const { create, stripe } = stripeFalso();
    for (const g of ["mujer", "HOMBRE", " neutro "]) {
      await createCheckoutSession({ ...valida, genero: g }, { stripe, ...ON });
    }
    expect(create.mock.calls.map((c) => c[0].metadata.genero)).toEqual(["mujer", "hombre", "neutro"]);
  });

  it("los géneros del API son los mismos que los del generador del PDF", async () => {
    const { GENEROS: delPdf } = await import("../../src/lib/oraculo/genero");
    expect([...GENEROS]).toEqual([...delPdf]);
  });

  it("limpiarEntrada acota longitudes", () => {
    const r = limpiarEntrada({ ...valida, nombre: "x".repeat(500) });
    expect(r.ok && r.data.nombre.length).toBe(100);
  });
});
