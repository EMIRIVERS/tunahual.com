import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NAHUALES_SEED, TONOS_SEED } from "@/test/seed";
import { nahualConocimientoExpandido } from "@/data/mayanKnowledge";
import { primeraFrase } from "@/lib/lectura";

// El diálogo y las pestañas de Radix no se pintan en el servidor: se sustituyen
// por contenedores simples para leer todas las pestañas a la vez.
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
}));
vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: ReactNode }) => <section>{children}</section>,
}));
// La capa cerrada no pinta su contenido aquí: así el test lee solo lo que se ve.
vi.mock("@/components/result/CapaBloqueada", () => ({
  CapaBloqueada: ({ abierta, titulo, children }: { abierta: boolean; titulo: string; children: ReactNode }) =>
    abierta ? <>{children}</> : <div data-capa={titulo}>CAPA CERRADA: {titulo}</div>,
}));
vi.mock("@/components/result/ShareButtons", () => ({ ShareButtons: () => null }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
vi.mock("@/hooks/useMayanData", () => ({
  useMayanData: () => ({ nahuales: NAHUALES_SEED, tonos: TONOS_SEED, loading: false, error: null }),
}));

const { MayanResultModal } = await import("../MayanResultModal");

// 15 mar 1990 = 7 Aq'ab'al
const nahual = NAHUALES_SEED.find((n) => n.nombre === "Aq'ab'al")!;
const tono = TONOS_SEED.find((t) => t.numero === 7)!;
const result = { nahual, tone: tono, kinNumber: 123 };
const saber = nahualConocimientoExpandido["Aq'ab'al"];

const pintar = (leadSubmitted: boolean) =>
  renderToStaticMarkup(
    <MayanResultModal
      isOpen
      onClose={() => {}}
      result={result}
      birthDate={new Date(1990, 2, 15)}
      cross={null}
      onSaveByEmail={() => {}}
      leadSubmitted={leadSubmitted}
    />
  ).replace(/&#x27;/g, "'").replace(/&quot;/g, '"');

describe("lectura sin dejar datos", () => {
  const html = pintar(false);

  it("muestra el nahual, el glifo, el elemento, el tono y una frase de cada uno", () => {
    expect(html).toContain("Aq'ab'al");
    expect(html).toContain(`Glifo ${nahual.animal_guia} · Elemento ${nahual.elemento}`);
    expect(html).toContain(primeraFrase(nahual.descripcion));
    expect(html).toContain(tono.nombre);
    expect(html).toContain(primeraFrase(tono.descripcion));
  });

  it("no muestra la interpretación extensa ni lo que se abre con contacto", () => {
    expect(html).not.toContain(nahual.descripcion); // completa, no solo la primera frase
    expect(html).not.toContain(tono.descripcion);
    for (const c of nahual.cualidades) expect(html).not.toContain(`>${c}<`);
    for (const s of nahual.sombras) expect(html).not.toContain(s);
    expect(html).not.toContain("Tu Trecena");
    expect(html).not.toContain(saber.significadoProfundo);
    expect(html).not.toContain(saber.mensajeEspiritual);
  });

  // La Cruz Maya ya estaba tras la capa y no cambia (la cubre el e2e de capas).
  it("pone tras la capa la lectura completa y el conocimiento", () => {
    expect(html).toContain('data-capa="Tu lectura completa te espera"');
    expect(html).toContain(`data-capa="El conocimiento de Aq'ab'al"`);
  });

  it("la tarjeta del cierre es el Mapa, en «Muy pronto», sin enlace a Azul ni flecha Unicode", () => {
    expect(html).toContain("Tu Mapa de Energía");
    expect(html).toContain("Muy pronto");
    expect(html).toContain("Avisarme cuando esté listo");
    expect(html).not.toContain("Conoce Azul Anaité");
    expect(html).not.toContain("Tu camino apenas comienza");
    expect(html).not.toContain("→");
    expect(html).not.toMatch(/gratis/i);
  });
});

describe("lectura con correo y WhatsApp", () => {
  const html = pintar(true);

  it("abre el animal guía, las cualidades, la trecena y el resumen del conocimiento", () => {
    expect(html).toContain(nahual.descripcion);
    for (const s of nahual.sombras) expect(html).toContain(s);
    expect(html).toContain("Tu Trecena");
    expect(html).toContain(saber.significadoProfundo);
    expect(html).toContain(saber.relacionConNaturaleza);
    expect(html).toContain(saber.mensajeEspiritual);
    expect(html).not.toContain("CAPA CERRADA");
  });

  it("la parte extensa sigue fuera de la web (es del Mapa)", () => {
    expect(html).not.toContain(saber.ceremoniasYRituales);
    expect(html).not.toContain(saber.trabajoEspiritual);
    expect(html).not.toContain("fueron fecundados");
    for (const s of saber.polaridadNegativa) expect(html).not.toContain(s);
    expect(html).toContain("La interpretación extensa de Aq'ab'al no se publica en esta página");
  });

  it("con la compra apagada no ofrece pagar: avisa que ya quedó apuntada", () => {
    expect(html).toContain("Te avisaremos a tu correo cuando esté listo.");
    expect(html).not.toContain("Obtener mi Mapa");
  });
});
