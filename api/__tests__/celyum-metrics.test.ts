import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import handler, { buildMetrics } from "../celyum-metrics";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const TOKEN = "a".repeat(64);
const CRM_URL = "https://fake-crm.supabase.co";
const SERVICE_KEY = "fake-service-key";
const TRECENA_ID = "00000000-0000-0000-0000-000000000000";

function fakeReq(overrides: Partial<VercelRequest> = {}): VercelRequest {
  return {
    method: "GET",
    headers: {},
    ...overrides,
  } as VercelRequest;
}

function fakeRes() {
  const res: Partial<VercelRes> = {};
  res.statusCode = 200;
  res.headers = {};
  res.setHeader = vi.fn((name: string, value: string) => {
    res.headers![name] = value;
  });
  res.status = vi.fn((code: number) => {
    res.statusCode = code;
    return res as VercelResponse;
  });
  res.json = vi.fn((body: unknown) => {
    res.body = body;
    return res as VercelResponse;
  });
  return res as VercelRes;
}

type VercelRes = VercelResponse & {
  statusCode: number;
  body?: unknown;
  headers: Record<string, string>;
};

const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_FETCH = global.fetch;

beforeEach(() => {
  process.env.CELYUM_METRICS_TOKEN = TOKEN;
  process.env.AZULANAITEOS_URL = CRM_URL;
  process.env.AZULANAITEOS_SERVICE_KEY = SERVICE_KEY;
  process.env.AZULANAITEOS_TRECENA_ID = TRECENA_ID;
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  global.fetch = ORIGINAL_FETCH;
  vi.restoreAllMocks();
});

describe("GET /api/celyum-metrics", () => {
  it("503 sin CELYUM_METRICS_TOKEN configurado", async () => {
    delete process.env.CELYUM_METRICS_TOKEN;
    const res = fakeRes();
    await handler(fakeReq({ headers: { authorization: "Bearer cualquiera" } }), res);
    expect(res.statusCode).toBe(503);
    expect(res.body).toEqual({ error: "not_configured" });
  });

  it("401 sin token", async () => {
    const res = fakeRes();
    await handler(fakeReq({ headers: {} }), res);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "unauthorized" });
  });

  it("401 con token malo", async () => {
    const res = fakeRes();
    await handler(fakeReq({ headers: { authorization: "Bearer token-incorrecto-de-64-caracteres-aaaaaaaaaaaaaaaaaaaaaaaaaa" } }), res);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "unauthorized" });
  });

  it("405 en POST", async () => {
    const res = fakeRes();
    await handler(fakeReq({ method: "POST", headers: { authorization: `Bearer ${TOKEN}` } }), res);
    expect(res.statusCode).toBe(405);
    expect(res.body).toEqual({ error: "method_not_allowed" });
  });

  it("200 con forma válida y token bueno (base simulada)", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(null, { status: 200, headers: { "content-range": "0-0/7" } })
    );
    global.fetch = fetchImpl as unknown as typeof fetch;

    const res = fakeRes();
    await handler(fakeReq({ headers: { authorization: `Bearer ${TOKEN}` } }), res);

    expect(res.statusCode).toBe(200);
    expect(res.headers["Cache-Control"]).toBe("no-store");
    expect(res.headers["X-Robots-Tag"]).toBe("noindex");
    const body = res.body as { project: string; status: string; metrics: unknown[] };
    expect(body.project).toBe("tu-nahual");
    expect(body.status).toBe("ok");
    expect(Array.isArray(body.metrics)).toBe(true);
    expect(body.metrics.length).toBeGreaterThanOrEqual(4);
    expect(body.metrics.length).toBeLessThanOrEqual(12);
    for (const metric of body.metrics as { name: string; label: string; value: number; period: string }[]) {
      expect(typeof metric.name).toBe("string");
      expect(typeof metric.label).toBe("string");
      expect(Number.isFinite(metric.value)).toBe(true);
      expect(["now", "24h", "7d", "30d", "total"]).toContain(metric.period);
    }
  });

  it("degraded si faltan las variables del CRM", async () => {
    delete process.env.AZULANAITEOS_URL;
    const res = fakeRes();
    await handler(fakeReq({ headers: { authorization: `Bearer ${TOKEN}` } }), res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      project: "tu-nahual",
      generated_at: expect.any(String),
      status: "degraded",
      metrics: [],
      error_code: "db_unreachable",
    });
  });

  it("degraded si la consulta al CRM lanza", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network down")) as unknown as typeof fetch;
    const res = fakeRes();
    await handler(fakeReq({ headers: { authorization: `Bearer ${TOKEN}` } }), res);
    expect(res.statusCode).toBe(200);
    const body = res.body as { status: string; metrics: unknown[]; error_code?: string };
    expect(body.status).toBe("degraded");
    expect(body.metrics).toEqual([]);
    expect(body.error_code).toBe("db_unreachable");
    // Nunca el mensaje interno del error.
    expect(JSON.stringify(body)).not.toContain("network down");
  });
});

describe("buildMetrics", () => {
  it("pide HEAD con Prefer: count=exact, filtrado a la trecena, sin traer filas", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(null, { status: 200, headers: { "content-range": "0-0/3" } })
    );

    const metrics = await buildMetrics(CRM_URL, SERVICE_KEY, TRECENA_ID, fetchImpl);

    expect(metrics.every((m) => m.value === 3)).toBe(true);
    for (const call of fetchImpl.mock.calls) {
      const [url, init] = call as [string, RequestInit];
      expect(init.method).toBe("HEAD");
      expect((init.headers as Record<string, string>).Prefer).toBe("count=exact");
      expect(url).toContain(`trecena_id=eq.${TRECENA_ID}`);
    }
  });
});
