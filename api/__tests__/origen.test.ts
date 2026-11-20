import { describe, it, expect } from "vitest";
import { origenPermitido } from "../_lib/origen";

describe("origenPermitido", () => {
  it("acepta el sitio y las previews de este proyecto", () => {
    for (const o of ["https://www.tunahual.com", "https://tunahual.com/resultado/7-aqabal", "https://tu-nahual-hbdd0zgqt-emi-rivers-projects.vercel.app", "https://tu-nahual-emi-rivers-projects.vercel.app/"]) {
      expect(origenPermitido(o, {})).toBe(true);
    }
  });

  it("rechaza dominios parecidos, otros *.vercel.app, http y basura", () => {
    for (const o of [
      "",
      "no es url",
      "https://tunahual.com.evil.com",
      "https://evil.com/?tunahual.com",
      "https://evil.com/https://www.tunahual.com",
      "https://www.tunahual.com.evil.com/x",
      "http://www.tunahual.com",
      "https://evil.vercel.app",
      "https://tu-nahual-x-otro-equipo.vercel.app",
      "https://nahual.com",
    ]) {
      expect(origenPermitido(o, {}), o).toBe(false);
    }
  });

  it("localhost solo fuera de producción", () => {
    expect(origenPermitido("http://localhost:8080", {})).toBe(true);
    expect(origenPermitido("http://localhost:8080", { VERCEL_ENV: "production" })).toBe(false);
    expect(origenPermitido("http://127.0.0.1:5173", { VERCEL_ENV: "production" })).toBe(false);
  });
});
