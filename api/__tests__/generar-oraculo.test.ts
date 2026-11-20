import { describe, it, expect, vi } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler, { generarParaPedido, oraculoHabilitado, igualesSeguro, borradorPermitido, sinCorreoPermitido, MAX_INTENTOS, type Dependencias, type PedidoGeneracion, type StorePedidos } from "../_oraculo/generar";
import { Contenido, fuenteEnMemoria } from "../../src/lib/oraculo/contenido";
import { relleno } from "../../src/lib/oraculo/fixtures";

const base: PedidoGeneracion = {
  stripe_session_id: "cs_test_1",
  email: "ana@mail.com",
  nombre: "Persona Ficticia",
  genero: "mujer",
  fecha_nacimiento: "1990-05-14",
  fecha_compra: "2026-10-04",
  generacion_estado: "pendiente",
  generacion_intentos: 0,
  updated_at: "2026-10-04T20:00:00Z",
};

function armar(p: Partial<PedidoGeneracion> | null = {}, extra: Partial<Dependencias> = {}, tomar = true) {
  const pedido = p === null ? null : { ...base, ...p };
  const store: StorePedidos = {
    leer: vi.fn().mockResolvedValue(pedido),
    tomar: vi.fn().mockResolvedValue(tomar),
    marcar: vi.fn().mockResolvedValue(undefined),
    pendientes: vi.fn().mockResolvedValue([]),
  };
  const deps: Dependencias = {
    store,
    contenido: (g, v) => new Contenido(fuenteEnMemoria({}), g, v, { relleno }),
    renderizar: vi.fn().mockResolvedValue(Buffer.from("%PDF-falso")),
    storage: { subir: vi.fn().mockResolvedValue(undefined), firmar: vi.fn().mockResolvedValue("https://x/firmado") },
    correo: vi.fn().mockResolvedValue(undefined),
    ahora: () => new Date("2026-10-04T20:05:00Z"),
    logger: { error: vi.fn() },
    ...extra,
  };
  return { deps, store };
}

describe("generar-oraculo", () => {
  it("la bandera ORACULO_PDF_HABILITADO=1 es la única que activa", () => {
    expect(oraculoHabilitado({})).toBe(false);
    expect(oraculoHabilitado({ ORACULO_PDF_HABILITADO: "true" })).toBe(false);
    expect(oraculoHabilitado({ ORACULO_PDF_HABILITADO: "1" })).toBe(true);
  });

  it("igualesSeguro compara secretos sin lanzar con largos distintos", () => {
    expect(igualesSeguro("Bearer abc", "Bearer abc")).toBe(true);
    expect(igualesSeguro("Bearer abc", "Bearer abd")).toBe(false);
    expect(igualesSeguro("Bearer abc", "Bearer abcd")).toBe(false);
    expect(igualesSeguro("", "x")).toBe(false);
  });

  it("camino feliz: sube a Storage, firma, manda correo y marca listo + entregado", async () => {
    const { deps, store } = armar();
    const r = await generarParaPedido("cs_test_1", deps);
    expect(r).toMatchObject({ estado: "listo", ruta: "cs_test_1.pdf" });
    expect(deps.storage.subir).toHaveBeenCalledWith("cs_test_1.pdf", expect.any(Buffer));
    expect(deps.storage.firmar).toHaveBeenCalledWith("cs_test_1.pdf", 7 * 24 * 3600);
    expect(deps.correo).toHaveBeenCalledWith(expect.objectContaining({ para: "ana@mail.com", nombre: "Persona Ficticia", enlace: "https://x/firmado", adjuntar: true }));
    expect(store.marcar).toHaveBeenLastCalledWith("cs_test_1", expect.objectContaining({ generacion_estado: "listo", entrega_estado: "entregado", pdf_path: "cs_test_1.pdf" }));
  });

  it("idempotente: un pedido ya listo no se regenera", async () => {
    const { deps } = armar({ generacion_estado: "listo" });
    expect(await generarParaPedido("cs_test_1", deps)).toEqual({ estado: "omitido", motivo: "ya generado" });
    expect(deps.renderizar).not.toHaveBeenCalled();
    expect(deps.correo).not.toHaveBeenCalled();
  });

  it("no hay doble ejecución: «generando» reciente y bloqueo perdido se omiten", async () => {
    const reciente = armar({ generacion_estado: "generando", updated_at: "2026-10-04T20:03:00Z" });
    expect((await generarParaPedido("cs_test_1", reciente.deps)).estado).toBe("omitido");
    const perdido = armar({}, {}, false);
    expect(await generarParaPedido("cs_test_1", perdido.deps)).toMatchObject({ estado: "omitido", motivo: expect.stringContaining("primero") });
    expect(perdido.deps.renderizar).not.toHaveBeenCalled();
  });

  it("un «generando» huérfano (>10 min) se retoma", async () => {
    const { deps } = armar({ generacion_estado: "generando", updated_at: "2026-10-04T19:00:00Z" });
    expect((await generarParaPedido("cs_test_1", deps)).estado).toBe("listo");
  });

  it("pedido inexistente o con 3 intentos agotados: se omite", async () => {
    expect((await generarParaPedido("cs_x", armar(null).deps)).estado).toBe("omitido");
    const { deps } = armar({ generacion_estado: "fallido", generacion_intentos: MAX_INTENTOS });
    expect(await generarParaPedido("cs_test_1", deps)).toMatchObject({ estado: "omitido", motivo: expect.stringContaining("revisar a mano") });
  });

  it("si el render falla, queda «fallido» y reintentable; no se manda correo", async () => {
    const { deps, store } = armar({}, { renderizar: vi.fn().mockRejectedValue(new Error("chromium murió")) });
    expect(await generarParaPedido("cs_test_1", deps)).toMatchObject({ estado: "fallido", reintentable: true });
    expect(store.marcar).toHaveBeenLastCalledWith("cs_test_1", expect.objectContaining({ generacion_estado: "fallido", generacion_detalle: expect.stringContaining("chromium") }));
    expect(deps.correo).not.toHaveBeenCalled();
  });

  it("faltan datos del pedido: falla sin reintento y sin render", async () => {
    for (const falta of [{ email: null }, { nombre: " " }, { fecha_compra: null }, { fecha_nacimiento: null }]) {
      const { deps } = armar(falta);
      expect(await generarParaPedido("cs_test_1", deps)).toMatchObject({ estado: "fallido", reintentable: false });
      expect(deps.renderizar).not.toHaveBeenCalled();
    }
  });

  it("sin género elegido se redacta en neutro (nunca se adivina)", async () => {
    const generos: string[] = [];
    const { deps } = armar({ genero: null }, { contenido: (g, v) => (generos.push(g), new Contenido(fuenteEnMemoria({}), g, v, { relleno })) });
    await generarParaPedido("cs_test_1", deps);
    expect(generos).toEqual(["neutro"]);
  });

  it("con exigirAprobado, el contenido en borrador NO se entrega", async () => {
    const { deps } = armar({}, { exigirAprobado: true });
    expect(await generarParaPedido("cs_test_1", deps)).toMatchObject({ estado: "fallido", reintentable: false, error: expect.stringContaining("sin aprobar") });
    expect(deps.renderizar).not.toHaveBeenCalled();
    expect(deps.correo).not.toHaveBeenCalled();
  });

  it("PDF grande: el correo lleva solo el enlace", async () => {
    const { deps } = armar({}, { renderizar: vi.fn().mockResolvedValue(Buffer.alloc(9 * 1024 * 1024)) });
    await generarParaPedido("cs_test_1", deps);
    expect(deps.correo).toHaveBeenCalledWith(expect.objectContaining({ adjuntar: false }));
  });
});

describe("generar-oraculo: endpoint y borrador", () => {
  const res = () => {
    const r = {
      headers: {} as Record<string, string>,
      code: 0,
      body: undefined as unknown,
      setHeader(k: string, v: string) {
        r.headers[k] = v;
        return r;
      },
      status(c: number) {
        r.code = c;
        return r;
      },
      json(b: unknown) {
        r.body = b;
        return r;
      },
    };
    return r;
  };
  const llamar = (req: object, r: ReturnType<typeof res>) => handler(req as unknown as VercelRequest, r as unknown as VercelResponse);

  it("sin token responde 401 aunque el interruptor esté apagado, y no es indexable", async () => {
    vi.stubEnv("ORACULO_PDF_HABILITADO", "");
    vi.stubEnv("ORACULO_TOKEN", "t".repeat(40));
    const r = res();
    await llamar({ method: "POST", headers: {}, body: { session_id: "cs_x" }, query: {} }, r);
    expect(r.code).toBe(401);
    expect(r.headers["X-Robots-Tag"]).toContain("noindex");
    vi.unstubAllEnvs();
  });

  it("con token válido pero interruptor apagado responde 503", async () => {
    vi.stubEnv("ORACULO_PDF_HABILITADO", "");
    vi.stubEnv("ORACULO_TOKEN", "t".repeat(40));
    const r = res();
    await llamar({ method: "POST", headers: { authorization: `Bearer ${"t".repeat(40)}` }, body: {}, query: {} }, r);
    expect(r.code).toBe(503);
    vi.unstubAllEnvs();
  });

  it("ORACULO_SIN_CORREO solo vale fuera de producción", () => {
    expect(sinCorreoPermitido({ ORACULO_SIN_CORREO: "1", VERCEL_ENV: "preview" })).toBe(true);
    expect(sinCorreoPermitido({ ORACULO_SIN_CORREO: "1", VERCEL_ENV: "production" })).toBe(false);
    expect(sinCorreoPermitido({})).toBe(false);
  });

  it("ORACULO_PERMITIR_BORRADOR solo vale fuera de producción", () => {
    expect(borradorPermitido({ ORACULO_PERMITIR_BORRADOR: "1", VERCEL_ENV: "preview" })).toBe(true);
    expect(borradorPermitido({ ORACULO_PERMITIR_BORRADOR: "1" })).toBe(true);
    expect(borradorPermitido({ ORACULO_PERMITIR_BORRADOR: "1", VERCEL_ENV: "production" })).toBe(false);
    expect(borradorPermitido({ VERCEL_ENV: "preview" })).toBe(false);
  });
});
