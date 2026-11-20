import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider, type HelmetServerState } from "react-helmet-async";
import { NAHUALES_SEED, TONOS_SEED } from "@/test/seed";
import { nahualToSlug } from "@/data/nahualSlugs";
import { contarPalabras } from "@/lib/lectura";
import { nahualConocimientoExpandido } from "@/data/mayanKnowledge";

vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
// La captura de contacto no es contenido: se deja fuera del conteo.
vi.mock("@/components/CapturaLectura", () => ({ CapturaLectura: () => null }));

let actual = NAHUALES_SEED[0];
vi.mock("@/hooks/useNahualBySlug", () => ({
  useNahualBySlug: () => ({ nahual: actual, loading: false, error: null }),
}));

const { default: NahualPage } = await import("../NahualPage");
const { KinVista } = await import("../KinPage");
const { parseKinSlug } = await import("@/data/nahualSlugs");

function pintar(ruta: string, elemento: JSX.Element) {
  const ctx: { helmet?: HelmetServerState } = {};
  const html = renderToStaticMarkup(
    <HelmetProvider context={ctx}>
      <MemoryRouter initialEntries={[ruta]}>
        <Routes>
          <Route path="/nahual/:slug" element={elemento} />
          <Route path="/kin/:kinSlug" element={elemento} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
  const h = ctx.helmet!;
  return {
    html,
    head: [h.title, h.meta, h.link, h.script].map((x) => x.toString()).join("\n"),
    palabrasMain: contarPalabras(
      (/<main[^>]*>([\s\S]*)<\/main>/.exec(html)?.[1] ?? "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&#x27;/g, "'")
        .replace(/&[a-z#0-9]+;/gi, " ")
    ),
  };
}

describe("/nahual/<slug>: introducción, datos y llamado", () => {
  for (const n of NAHUALES_SEED) {
    it(`${n.nombre}: conserva SEO y no queda delgada`, () => {
      actual = n;
      const slug = nahualToSlug[n.nombre];
      const { html, head, palabrasMain } = pintar(`/nahual/${slug}`, <NahualPage />);
      expect(head).toContain(`<title data-rh="true">${n.nombre.replace(/'/g, "&#x27;")} - Nahual Maya`);
      expect(head).toMatch(/<meta data-rh="true" name="description" content="[^"]{80,}/);
      expect(head).toContain(`rel="canonical" href="https://www.tunahual.com/nahual/${slug}"`);
      expect(head.match(/application\/ld\+json/g)?.length).toBe(2);
      expect(html).toMatch(/<h1[^>]*>/);
      expect(html).toContain("Descubre tu propio Nahual");
      expect(palabrasMain).toBeGreaterThanOrEqual(150);
      expect(palabrasMain).toBeLessThanOrEqual(320);
      expect(html).not.toContain("→");
    });
  }

  it("no publica el conocimiento profundo aunque la base lo traiga", () => {
    const n = NAHUALES_SEED.find((x) => x.nombre === "Imox")!;
    const c = nahualConocimientoExpandido["Imox"];
    actual = { ...n, significado_profundo: c.significadoProfundo, ceremonias_rituales: c.ceremoniasYRituales, mensaje_espiritual: c.mensajeEspiritual } as typeof n;
    const { html } = pintar("/nahual/imox", <NahualPage />);
    expect(html).not.toContain(c.significadoProfundo);
    expect(html).not.toContain(c.ceremoniasYRituales);
    expect(html).not.toContain(c.mensajeEspiritual);
    for (const s of n.sombras) expect(html).not.toContain(s);
  });
});

describe("/kin/<slug>: introducción, datos y llamado", () => {
  const casos = TONOS_SEED.flatMap((t) => NAHUALES_SEED.map((n) => ({ t, n })));
  it("los 260 kines conservan SEO y quedan entre 150 y 320 palabras", () => {
    for (const { t, n } of casos) {
      const kinSlug = `${t.numero}-${nahualToSlug[n.nombre]}`;
      const parsed = parseKinSlug(kinSlug)!;
      const { html, head, palabrasMain } = pintar(
        `/kin/${kinSlug}`,
        <KinVista kinSlug={kinSlug} parsed={parsed} nahual={n} tono={t} />
      );
      expect(head, kinSlug).toContain(`Kin ${parsed.kinNumber}:`);
      expect(head, kinSlug).toContain(`rel="canonical" href="https://www.tunahual.com/kin/${kinSlug}"`);
      expect(head.match(/application\/ld\+json/g)?.length, kinSlug).toBe(3);
      expect(html, kinSlug).toContain(`Significado del Kin ${parsed.kinNumber}`);
      expect(palabrasMain, kinSlug).toBeGreaterThanOrEqual(150);
      expect(palabrasMain, kinSlug).toBeLessThanOrEqual(320);
      for (const s of n.sombras) expect(html, kinSlug).not.toContain(s);
      expect(html, kinSlug).not.toContain("→");
    }
  });
});
