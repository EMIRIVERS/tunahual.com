import { describe, expect, it, vi } from "vitest";
import { syncLeadToCrm, type SyncLeadInput } from "../sync-lead";

const leadBase: SyncLeadInput = {
  nombre: "Ixchel",
  email: "ixchel@example.com",
  telefono: "50212345678",
  nahual: "Batz'",
  tono: 5,
  kin_completo: "5 Batz'",
  fecha_nacimiento: "1990-04-12",
};

function fakeLogger() {
  return { error: vi.fn() };
}

describe("syncLeadToCrm", () => {
  it("regresa synced:true cuando el CRM acepta el lead (el lead ya está guardado en Supabase antes de llamar esto)", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(null, { status: 201 })
    );
    const logger = fakeLogger();

    const result = await syncLeadToCrm(leadBase, "fake-service-key", fetchImpl, logger);

    expect(result).toEqual({ synced: true });
    expect(logger.error).not.toHaveBeenCalled();
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("NO se traga el fallo del CRM: regresa synced:false y deja detalle reprocesable en el log", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response("service unavailable", { status: 503 })
    );
    const logger = fakeLogger();

    const result = await syncLeadToCrm(leadBase, "fake-service-key", fetchImpl, logger);

    expect(result.synced).toBe(false);
    expect((result as { crmError: string }).crmError).toContain("service unavailable");

    // El log debe traer suficiente detalle para reprocesar: identificador
    // del lead (email/telefono/fecha) y el error del CRM.
    expect(logger.error).toHaveBeenCalledTimes(1);
    const loggedMessage = logger.error.mock.calls[0][0] as string;
    expect(loggedMessage).toContain(leadBase.email as string);
    expect(loggedMessage).toContain(leadBase.telefono);
    expect(loggedMessage).toContain("503");
    expect(loggedMessage).toContain("service unavailable");
  });

  it("una excepción de red tampoco se traga: synced:false + log con el mensaje del error", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network down"));
    const logger = fakeLogger();

    const result = await syncLeadToCrm(leadBase, "fake-service-key", fetchImpl, logger);

    expect(result.synced).toBe(false);
    expect((result as { crmError: string }).crmError).toBe("network down");
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error.mock.calls[0][0]).toContain("network down");
  });

  it("un duplicado (409) cuenta como sincronizado, no como fallo", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response("unique constraint", { status: 409 })
    );
    const logger = fakeLogger();

    const result = await syncLeadToCrm(leadBase, "fake-service-key", fetchImpl, logger);

    expect(result).toEqual({ synced: true, duplicate: true });
    expect(logger.error).not.toHaveBeenCalled();
  });
});
