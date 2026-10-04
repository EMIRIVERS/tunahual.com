import { describe, it, expect, vi } from "vitest";
import { buildKajabiPayload, sendToKajabi } from "../kajabi";

describe("kajabi", () => {
  it("etiqueta tunahual + nahual-<slug>", () => {
    const p = buildKajabiPayload({ nombre: " Ana ", email: "ANA@MAIL.com", nahualSlug: "kat", tono: 3 });
    expect(p).toMatchObject({
      name: "Ana",
      email: "ana@mail.com",
      tags: ["tunahual", "nahual-kat"],
      custom_fields: { tono: "3" },
    });
  });

  it("ignora un slug raro y rechaza correos inválidos", () => {
    expect(buildKajabiPayload({ nombre: "A", email: "a@b.co", nahualSlug: "x;drop" })?.tags).toEqual(["tunahual"]);
    expect(buildKajabiPayload({ nombre: "A", email: "no-es-correo" })).toBeNull();
  });

  it("sin webhook configurado no llama a nadie", async () => {
    const f = vi.fn();
    const r = await sendToKajabi({ nombre: "A", email: "a@b.co" }, undefined, f as unknown as typeof fetch);
    expect(r.ok).toBe(false);
    expect(f).not.toHaveBeenCalled();
  });

  it("envía el JSON y nunca lanza si falla", async () => {
    const ok = vi.fn().mockResolvedValue({ ok: true });
    const r1 = await sendToKajabi({ nombre: "A", email: "a@b.co", nahualSlug: "imox" }, "https://h", ok as unknown as typeof fetch);
    expect(r1.ok).toBe(true);
    expect(JSON.parse(ok.mock.calls[0][1].body).tags).toContain("nahual-imox");

    const boom = vi.fn().mockRejectedValue(new Error("red"));
    const r2 = await sendToKajabi({ nombre: "A", email: "a@b.co" }, "https://h", boom as unknown as typeof fetch, { error: vi.fn() });
    expect(r2.ok).toBe(false);
  });
});
