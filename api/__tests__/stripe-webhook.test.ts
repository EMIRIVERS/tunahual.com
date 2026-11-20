import { describe, it, expect, vi } from "vitest";
import Stripe from "stripe";
import {
  procesarWebhook,
  entregarMapa,
  encolarOraculo,
  crearStoreSupabase,
  pedidoDesdeSesion,
  fechaCompraISO,
  type Pedido,
  type PedidosStore,
} from "../stripe-webhook";

// Valores de prueba, no son llaves reales.
const SECRET_KEY = "clave_falsa_para_pruebas";
const WH_SECRET = "whsec_dummy_para_pruebas";
const stripe = new Stripe(SECRET_KEY);

function evento(sobre: Partial<Stripe.Checkout.Session> = {}, type = "checkout.session.completed") {
  const sesion = {
    id: "cs_test_1",
    payment_status: "paid",
    payment_intent: "pi_1",
    amount_total: 1100,
    currency: "usd",
    customer_details: { email: "Ana@Mail.com", name: "Ana López" },
    metadata: { producto: "mapa-energia", kin_slug: "7-aqabal", nahual_slug: "aqabal", tono: "7", nahual: "Aq'ab'al", fecha_nacimiento: "1990-03-15", genero: "hombre" },
    created: Date.UTC(2026, 9, 5, 3, 30) / 1000, // 4-oct 21:30 en Ciudad de México
    ...sobre,
  };
  const payload = JSON.stringify({ id: "evt_1", object: "event", type, data: { object: sesion } });
  const firma = stripe.webhooks.generateTestHeaderString({ payload, secret: WH_SECRET });
  return { payload, firma };
}

function storeFalso(existente?: "pendiente" | "entregado"): PedidosStore & { insertar: ReturnType<typeof vi.fn>; marcar: ReturnType<typeof vi.fn> } {
  return {
    insertar: vi.fn().mockImplementation(async (p: Pedido) =>
      existente ? { created: false, existente: { ...p, entrega_estado: existente } } : { created: true }
    ),
    marcar: vi.fn().mockResolvedValue(undefined),
  };
}

const logger = { error: vi.fn() };
const base = { secretKey: SECRET_KEY, webhookSecret: WH_SECRET, logger };

describe("stripe-webhook", () => {
  it("sin llaves de Stripe responde 503", async () => {
    const e = evento();
    expect((await procesarWebhook(e.payload, e.firma, { secretKey: undefined, webhookSecret: undefined })).status).toBe(503);
    expect((await procesarWebhook(e.payload, e.firma, { secretKey: SECRET_KEY, webhookSecret: undefined })).status).toBe(503);
  });

  it("firma inválida o ausente responde 400 y no toca la base", async () => {
    const store = storeFalso();
    const e = evento();
    expect((await procesarWebhook(e.payload, "t=1,v1=deadbeef", { ...base, store })).status).toBe(400);
    expect((await procesarWebhook(e.payload, undefined, { ...base, store })).status).toBe(400);
    // cuerpo alterado después de firmar
    expect((await procesarWebhook(e.payload.replace("1100", "1"), e.firma, { ...base, store })).status).toBe(400);
    expect(store.insertar).not.toHaveBeenCalled();
  });

  it("registra el pedido y entrega en el primer evento", async () => {
    const store = storeFalso();
    const entregar = vi.fn().mockResolvedValue({ estado: "entregado", detalle: "ok" });
    const e = evento();
    const r = await procesarWebhook(e.payload, e.firma, { ...base, store, entregar });
    expect(r).toEqual({ status: 200, body: { received: true, duplicate: false, entrega: "entregado" } });
    expect(store.insertar).toHaveBeenCalledWith(
      expect.objectContaining({ stripe_session_id: "cs_test_1", email: "ana@mail.com", nombre: "Ana López", kin_slug: "7-aqabal", tono: 7, monto_centavos: 1100, genero: "hombre", fecha_compra: "2026-10-04" })
    );
    expect(store.marcar).toHaveBeenCalledWith("cs_test_1", "entregado", "ok");
  });

  it("evento duplicado ya entregado: 200 sin volver a entregar", async () => {
    const store = storeFalso("entregado");
    const entregar = vi.fn();
    const e = evento();
    const r = await procesarWebhook(e.payload, e.firma, { ...base, store, entregar });
    expect(r).toEqual({ status: 200, body: { received: true, duplicate: true } });
    expect(entregar).not.toHaveBeenCalled();
    expect(store.marcar).not.toHaveBeenCalled();
  });

  it("evento duplicado con entrega pendiente reintenta la entrega", async () => {
    const store = storeFalso("pendiente");
    const entregar = vi.fn().mockResolvedValue({ estado: "entregado", detalle: "ok" });
    const e = evento();
    const r = await procesarWebhook(e.payload, e.firma, { ...base, store, entregar });
    expect(r.status).toBe(200);
    expect(entregar).toHaveBeenCalledTimes(1);
  });

  it("si la entrega falla o lanza, el pedido igual queda y se marca pendiente", async () => {
    const store = storeFalso();
    const e = evento();
    const r = await procesarWebhook(e.payload, e.firma, { ...base, store, entregar: vi.fn().mockRejectedValue(new Error("resend caído")) });
    expect(r.status).toBe(200);
    expect(store.marcar).toHaveBeenCalledWith("cs_test_1", "pendiente", expect.stringContaining("resend caído"));
  });

  it("sin credenciales de Supabase responde 503 para que Stripe reintente", async () => {
    const e = evento();
    expect((await procesarWebhook(e.payload, e.firma, { ...base, store: null })).status).toBe(503);
  });

  it("ignora otros tipos de evento, pagos sin cobrar y otros productos", async () => {
    const store = storeFalso();
    const otro = evento({}, "customer.created");
    expect((await procesarWebhook(otro.payload, otro.firma, { ...base, store })).body).toMatchObject({ ignored: "customer.created" });
    const sinPagar = evento({ payment_status: "unpaid" });
    expect((await procesarWebhook(sinPagar.payload, sinPagar.firma, { ...base, store })).body).toHaveProperty("ignored");
    const ajeno = evento({ metadata: { producto: "otra-cosa" } });
    expect((await procesarWebhook(ajeno.payload, ajeno.firma, { ...base, store })).body).toMatchObject({ ignored: "otro producto" });
    expect(store.insertar).not.toHaveBeenCalled();
  });
});

describe("entregarMapa", () => {
  const pedido: Pedido = { stripe_session_id: "cs_1", stripe_payment_intent: null, email: "ana@mail.com", nombre: "Ana", nahual_slug: "aqabal", nahual: "Aq'ab'al", kin_slug: "7-aqabal", tono: 7, fecha_nacimiento: "1990-03-15", genero: "mujer", fecha_compra: "2026-10-04", monto_centavos: 1100, moneda: "usd" };
  const silencio = { error: vi.fn() };

  it("sin variables queda pendiente con el motivo y no llama a nadie", async () => {
    const f = vi.fn();
    const r = await entregarMapa(pedido, {}, f as unknown as typeof fetch, silencio);
    expect(r.estado).toBe("pendiente");
    expect(r.detalle).toContain("RESEND_API_KEY");
    expect(r.detalle).toContain("MAPA_PDF_BASE_URL");
    expect(f).not.toHaveBeenCalled();
  });

  it("con Resend y base de PDFs envía el correo con el adjunto y etiqueta en Kajabi", async () => {
    const f = vi.fn().mockResolvedValue({ ok: true, text: async () => "" });
    const r = await entregarMapa(
      pedido,
      { RESEND_API_KEY: "re_dummy", MAPA_PDF_BASE_URL: "https://pdfs.example/mapas/", KAJABI_WEBHOOK_URL: "https://kajabi.example/h" },
      f as unknown as typeof fetch,
      silencio
    );
    expect(r.estado).toBe("entregado");
    const llamadas = f.mock.calls.map((c) => String(c[0]));
    expect(llamadas).toContain("https://kajabi.example/h");
    const resend = f.mock.calls.find((c) => String(c[0]).includes("resend.com"))!;
    const cuerpo = JSON.parse(resend[1].body);
    expect(cuerpo.to).toBe("ana@mail.com");
    expect(cuerpo.attachments[0].path).toBe("https://pdfs.example/mapas/mapa-7-aqabal.pdf");
    const kajabi = JSON.parse(f.mock.calls.find((c) => c[0] === "https://kajabi.example/h")![1].body);
    expect(kajabi.tags).toEqual(["tunahual", "nahual-aqabal", "mapa-energia"]);
  });

  it("si Resend responde error queda pendiente", async () => {
    const f = vi.fn().mockResolvedValue({ ok: false, status: 422, text: async () => "bad" });
    const r = await entregarMapa(pedido, { RESEND_API_KEY: "re_dummy", MAPA_PDF_BASE_URL: "https://p" }, f as unknown as typeof fetch, silencio);
    expect(r).toMatchObject({ estado: "pendiente" });
  });
});

describe("store de Supabase y sesión", () => {
  it("sin SUPABASE_SERVICE_ROLE_KEY o URL no hay store", () => {
    expect(crearStoreSupabase({ VITE_SUPABASE_URL: "https://x.supabase.co" })).toBeNull();
    expect(crearStoreSupabase({ SUPABASE_SERVICE_ROLE_KEY: "k" })).toBeNull();
  });

  it("insertar detecta duplicados por respuesta vacía de ignore-duplicates", async () => {
    const pedido = pedidoDesdeSesion({ id: "cs_9", metadata: { producto: "mapa-energia", kin_slug: "1-imox", nahual_slug: "imox", tono: "1" } } as never)!;
    const f = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ ...pedido, entrega_estado: "entregado" }] });
    const store = crearStoreSupabase({ VITE_SUPABASE_URL: "https://x.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "k" }, f as unknown as typeof fetch)!;
    const r = await store.insertar(pedido);
    expect(r).toMatchObject({ created: false, existente: { entrega_estado: "entregado" } });
    expect(String(f.mock.calls[0][0])).toContain("on_conflict=stripe_session_id");
  });

  it("genero inválido o ausente queda null (el PDF usa texto neutro); fecha_compra usa la zona del negocio", () => {
    const base = { id: "x", created: Date.UTC(2026, 9, 5, 7, 0) / 1000, metadata: { producto: "mapa-energia", kin_slug: "1-imox", nahual_slug: "imox", tono: "1" } };
    expect(pedidoDesdeSesion({ ...base, metadata: { ...base.metadata, genero: "otro" } } as never)).toMatchObject({ genero: null, fecha_compra: "2026-10-05" });
    expect(pedidoDesdeSesion(base as never)).toMatchObject({ genero: null });
    expect(pedidoDesdeSesion({ ...base, metadata: { ...base.metadata, genero: "mujer" } } as never)?.genero).toBe("mujer");
  });

  it("fechaCompraISO: zona inválida o sin instante → null", () => {
    expect(fechaCompraISO(Date.UTC(2026, 9, 5, 3, 30) / 1000, "America/Mexico_City")).toBe("2026-10-04");
    expect(fechaCompraISO(Date.UTC(2026, 9, 5, 3, 30) / 1000, "America/Guatemala")).toBe("2026-10-04");
    expect(fechaCompraISO(Date.UTC(2026, 9, 5, 3, 30) / 1000, "Zona/Falsa")).toBeNull();
    expect(fechaCompraISO(undefined)).toBeNull();
  });

  it("pedidoDesdeSesion ignora sesiones de otros productos", () => {
    expect(pedidoDesdeSesion({ id: "x", metadata: {} } as never)).toBeNull();
  });
});

describe("encolarOraculo (generación asíncrona, detrás de bandera)", () => {
  const pedido: Pedido = { stripe_session_id: "cs_9", stripe_payment_intent: null, email: "a@b.co", nombre: "Ana", nahual_slug: "imox", nahual: "Imox", kin_slug: "1-imox", tono: 1, fecha_nacimiento: "1990-03-15", genero: "neutro", fecha_compra: "2026-10-04", monto_centavos: 1100, moneda: "usd" };
  const logger = { error: vi.fn() };

  it("sin ORACULO_TOKEN no llama a nadie y queda pendiente", async () => {
    const f = vi.fn();
    const r = await encolarOraculo(pedido, {}, f as unknown as typeof fetch, logger);
    expect(r.estado).toBe("pendiente");
    expect(f).not.toHaveBeenCalled();
  });

  it("avisa a /api/generar-oraculo con el token y el session id; devuelve pendiente (entrega la otra función)", async () => {
    const f = vi.fn().mockResolvedValue({ ok: true });
    const r = await encolarOraculo(pedido, { ORACULO_TOKEN: "tok", ORACULO_FUNCION_URL: "https://x.test/" }, f as unknown as typeof fetch, logger);
    expect(r).toEqual({ estado: "pendiente", detalle: "generación del Oráculo encolada" });
    expect(f.mock.calls[0][0]).toBe("https://x.test/api/generar-oraculo");
    expect(f.mock.calls[0][1].headers.Authorization).toBe("Bearer tok");
    expect(JSON.parse(f.mock.calls[0][1].body)).toEqual({ session_id: "cs_9" });
  });

  it("un tiempo agotado es normal y no se registra como error; otros fallos sí, pero no lanzan", async () => {
    const e1 = vi.fn().mockRejectedValue(new DOMException("The operation timed out", "TimeoutError"));
    expect((await encolarOraculo(pedido, { ORACULO_TOKEN: "t" }, e1 as unknown as typeof fetch, logger)).estado).toBe("pendiente");
    expect(logger.error).not.toHaveBeenCalled();
    const e2 = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"));
    expect((await encolarOraculo(pedido, { ORACULO_TOKEN: "t" }, e2 as unknown as typeof fetch, logger)).estado).toBe("pendiente");
    expect(logger.error).toHaveBeenCalledTimes(1);
  });
});
