import { useState, lazy, Suspense, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useMayanData } from "@/hooks/useMayanData";
import {
  calculateMayanKinFromDB,
  calculateMayanCrossFromDB,
  MayanKinDB,
  MayanCrossDB,
} from "@/utils/mayanCalculations";
import { Calendar, ArrowLeft, Loader2, Globe } from "lucide-react";
import { EnergiaDelDia } from "@/components/EnergiaDelDia";
import logo from "@/assets/logo-azul-anaite.png";
import lagoAtitlan from "@/assets/lago-atitlan-bg.jpg";
import { useLeadCapture } from "@/hooks/useLeadCapture";
import { trackEvent } from "@/lib/analytics";

// Video de fondo de toda la pantalla — public/videos/fondo-tu-nahual.mp4.
// Debajo siempre está la foto del lago de Atitlán: es el fondo en móvil, con
// movimiento reducido o si el video no existe (404).
const BG_VIDEO_SRC = "/videos/fondo-tu-nahual.mp4";

// Redes de Azul Anaité, en monocromo bronce (currentColor), sin colores de marca.
const REDES = [
  {
    nombre: "Instagram",
    href: "https://www.instagram.com/azulanaite/",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    nombre: "Facebook",
    href: "https://www.facebook.com/Azulanaite/",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    nombre: "TikTok",
    href: "https://www.tiktok.com/@azulanaite13",
    path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  },
  {
    nombre: "Spotify",
    href: "https://open.spotify.com/show/26LpXjwLXlQ1Fe06kfEoRT",
    path: "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z",
  },
];

// Lazy load heavy modals - critical for LCP
const MayanResultModal = lazy(() => 
  import("@/components/MayanResultModal").then(m => ({ default: m.MayanResultModal }))
);
const LeadCaptureModal = lazy(() => 
  import("@/components/LeadCaptureModal").then(m => ({ default: m.LeadCaptureModal }))
);

const Index = () => {
  const [birthDate, setBirthDate] = useState<string>("");
  const [result, setResult] = useState<MayanKinDB | null>(null);
  const [cross, setCross] = useState<MayanCrossDB | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { submit: enviarLead, isSubmitting: isSubmittingLead, leadSubmitted, emailSent } = useLeadCapture();
  const [bgVideoFailed, setBgVideoFailed] = useState(false);
  const heroReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // En móvil (<768px) no se descarga el video de 5.9 MB: cae directo al
  // foto del lago, que ya hace de fondo/poster.
  const isMobileViewport =
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
  const showBgVideo = !bgVideoFailed && !heroReducedMotion && !isMobileViewport;

  const { nahuales, tonos, loading: loadingData } = useMayanData();

  // Memoize max date to avoid recalculating on each render
  const maxDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  const handleCalculate = useCallback(() => {
    if (!birthDate || nahuales.length === 0 || tonos.length === 0) return;
    setIsCalculating(true);

    // Use requestIdleCallback for non-critical calculation to improve INP
    const calculate = () => {
      const [year, month, day] = birthDate.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      const mayanKin = calculateMayanKinFromDB(date, nahuales, tonos);
      const mayanCross = calculateMayanCrossFromDB(date, nahuales, tonos);
      setSelectedDate(date);
      setResult(mayanKin);
      setCross(mayanCross);

      setTimeout(() => {
        setIsCalculating(false);
        // Mostrar la lectura directamente (sin muro). Se invita a guardarla
        // por email DESDE el resultado.
        setIsResultModalOpen(true);
        // Track calculation event
        trackEvent('calcular_nahual', {
          nahual: mayanKin?.nahual?.nombre,
          tono: mayanKin?.tone?.numero,
        });
      }, 600);
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(calculate, { timeout: 100 });
    } else {
      setTimeout(calculate, 0);
    }
  }, [birthDate, nahuales, tonos]);

  const handleLeadSubmit = useCallback(
    async (nombre: string, email: string, telefono: string) => {
      if (!result || !selectedDate) return;
      const ok = await enviarLead({
        nombre,
        email,
        telefono,
        fechaNacimiento: birthDate,
        nahual: result.nahual,
        tono: result.tone.numero,
        origen: "home",
      });
      if (ok) setIsLeadModalOpen(false);
    },
    [result, selectedDate, birthDate, enviarLead]
  );

  const handleCloseLeadModal = useCallback(() => setIsLeadModalOpen(false), []);
  const handleCloseResultModal = useCallback(() => setIsResultModalOpen(false), []);

  // Show form immediately - don't wait for data to load (improves LCP)
  const isButtonDisabled = !birthDate || loadingData || nahuales.length === 0;

  return (
    <>
      <Helmet>
        <title>Calculadora Maya Gratis: Descubre tu Nahual y Signo Maya | Cholq'ij</title>
        <meta name="description" content="Calcula tu Nahual Maya por fecha de nacimiento. Descubre tu signo del calendario sagrado Cholq'ij, tu Tono y tu Cruz Maya completa de 9 posiciones." />
        <link rel="canonical" href="https://www.tunahual.com/" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.tunahual.com/" />
        <meta property="og:title" content="Calculadora Maya Gratis: Descubre tu Nahual y Signo Maya" />
        <meta property="og:description" content="Calcula tu Nahual Maya por fecha de nacimiento. Descubre tu signo del calendario sagrado Cholq'ij, tu Tono y tu Cruz Maya completa." />
        <meta property="og:image" content="https://www.tunahual.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="es_ES" />
        <meta property="og:site_name" content="Tu Nahual - Calculadora Maya" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.tunahual.com/" />
        <meta name="twitter:title" content="Calculadora Maya Gratis: Descubre tu Nahual y Signo Maya" />
        <meta name="twitter:description" content="Calcula tu Nahual Maya por fecha de nacimiento. Descubre tu signo del calendario sagrado Cholq'ij." />
        <meta name="twitter:image" content="https://www.tunahual.com/og-image.png" />
        
        {/* Additional SEO */}
        <meta name="keywords" content="nahual maya, calculadora maya, signo maya, cholqij, calendario maya, horóscopo maya, cruz maya, tono maya" />
        <meta name="author" content="Azul Anaité" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/*
        html/body son position:fixed + overflow:hidden (index.css), así que la
        home es su propio contenedor de scroll. Antes era un armazón fijo con
        header y footer rígidos y un <main> centrado con flex: cuando el
        contenido no cabía, la parte de arriba quedaba recortada sin poder
        alcanzarla y el formulario quedaba debajo del pie. Ahora todo fluye.
      */}
      <div className="fixed inset-0 overflow-y-auto overflow-x-hidden overscroll-contain touch-manipulation">
        {/* Fondo: foto del lago (siempre) + video en escritorio + velo para contraste AA */}
        <div aria-hidden className="fixed inset-0 overflow-hidden bg-background">
          <img
            src={lagoAtitlan}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[42%_center]"
            decoding="async"
          />
          {showBgVideo && (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={BG_VIDEO_SRC}
              poster={lagoAtitlan}
              autoPlay
              muted
              loop
              playsInline
              onError={() => setBgVideoFailed(true)}
            />
          )}
          <div className="absolute inset-0 home-velo" />
        </div>

        <div className="relative flex min-h-full flex-col">
          <header
            className="shrink-0"
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            <div
              className="mx-auto grid max-w-5xl grid-cols-[1fr_auto_1fr] items-center px-5 py-3"
              style={{
                paddingLeft: "max(1.25rem, env(safe-area-inset-left))",
                paddingRight: "max(1.25rem, env(safe-area-inset-right))",
              }}
            >
              <a
                href="https://azulanaite.com"
                target="_blank"
                rel="noopener noreferrer"
                className="-ml-2 flex items-center gap-2 justify-self-start rounded-full p-2 text-foreground/70 transition-colors hover:text-foreground"
                aria-label="Volver a Azul Anaité"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden text-sm sm:inline">Azul Anaité</span>
              </a>
              <img
                src={logo}
                alt="Azul Anaité"
                className="h-12 w-auto sm:h-14"
                width={280}
                height={80}
                loading="eager"
                fetchPriority="high"
              />
              <span />
            </div>
          </header>

          <main className="flex flex-1 px-5 pb-12 pt-6 sm:pt-10 md:items-center md:pb-16">
            {isCalculating ? (
              /* Ceremonial reveal — concentric rings turning slowly, not a busy spinner */
              <div className="mx-auto w-full max-w-md animate-fade-in">
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative w-28 h-28 mb-7">
                    <div className="absolute inset-0 rounded-full border border-primary/20 animate-spin" style={{ animationDuration: '9s' }} />
                    <div className="absolute inset-3 rounded-full border border-primary/30 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
                    <div className="absolute inset-6 rounded-full border border-primary/40 animate-spin" style={{ animationDuration: '4s' }} />
                    <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-primary animate-pulse-slow" />
                    <Calendar className="absolute inset-0 m-auto w-6 h-6 text-primary/70" />
                  </div>
                  <p className="font-serif text-2xl text-foreground text-center">
                    Consultando el calendario sagrado
                  </p>
                  <p className="font-serif italic text-base text-secondary-foreground mt-2">
                    Cholq'ij
                  </p>
                </div>
              </div>
            ) : (
              <div className="mx-auto grid w-full max-w-md animate-fade-in gap-12 md:max-w-5xl md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-end md:gap-20">
                {/* Acción principal: calcular el Nahual */}
                <div>
                  <p className="font-serif text-lg italic text-secondary-foreground">
                    Calendario sagrado Cholq'ij
                  </p>
                  <h1 className="mt-1 font-serif text-[3.25rem] font-semibold leading-[0.95] tracking-[-0.02em] text-foreground sm:text-7xl">
                    Descubre tu Nahual
                  </h1>
                  <p className="mt-4 max-w-[34ch] text-base leading-relaxed text-foreground/80">
                    La energía del día en que naciste, leída a través de la
                    cuenta sagrada maya k'iche'.
                  </p>

                  <div className="mt-7 rounded-[1.25rem] border border-primary/20 bg-card p-5 shadow-[0_24px_48px_-28px_hsl(30_25%_20%/0.45)] sm:p-6">
                    <label
                      htmlFor="birth-date"
                      className="block text-sm font-medium text-foreground"
                    >
                      Tu fecha de nacimiento
                    </label>
                    <div className="relative mt-2">
                      <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-foreground" />
                      {/* text-base (16px): con menos, iOS hace zoom al enfocar */}
                      <input
                        type="date"
                        id="birth-date"
                        name="birth-date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="campo-fecha h-12 w-full min-w-0 appearance-none rounded-full border border-input bg-background pl-11 pr-4 text-left text-base text-foreground transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                        max={maxDate}
                      />
                    </div>
                    <Button
                      onClick={handleCalculate}
                      disabled={isButtonDisabled}
                      variant="cta"
                      // Bronce un punto más oscuro que --primary: texto crema con contraste AA (≈5:1)
                      className="mt-3 h-12 w-full rounded-full bg-[hsl(35_60%_34%)] text-base font-medium hover:bg-[hsl(35_60%_30%)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loadingData ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Cargando...
                        </>
                      ) : (
                        "Conocer mi Nahual"
                      )}
                    </Button>
                    {result !== null && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 w-full text-foreground/70"
                        onClick={() => {
                          setResult(null);
                          setCross(null);
                          setSelectedDate(null);
                          setBirthDate("");
                        }}
                      >
                        <ArrowLeft className="mr-1.5 h-4 w-4" />
                        Calcular otra fecha
                      </Button>
                    )}
                  </div>

                  {/* «¿Por qué conocer tu Nahual?», reducido a su frase */}
                  <p className="mt-5 max-w-[36ch] font-serif text-lg italic leading-snug text-foreground/80">
                    Un mapa preciso para que recuerdes quién naciste siendo.
                  </p>
                </div>

                {/* Pieza secundaria: la energía del día */}
                <EnergiaDelDia nahuales={nahuales} tonos={tonos} />
              </div>
            )}
          </main>

          <footer
            className="shrink-0 border-t border-primary/15"
            style={{
              paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
              paddingLeft: "max(1.25rem, env(safe-area-inset-left))",
              paddingRight: "max(1.25rem, env(safe-area-inset-right))",
            }}
          >
            <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 pt-5 md:flex-row md:justify-between">
              <ul className="flex items-center gap-1" aria-label="Redes de Azul Anaité">
                {REDES.map((red) => (
                  <li key={red.nombre}>
                    <a
                      href={red.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={red.nombre}
                      className="grid h-11 w-11 place-items-center rounded-full text-secondary-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
                    >
                      <svg viewBox="0 0 24 24" className="h-[1.125rem] w-[1.125rem] fill-current" aria-hidden>
                        <path d={red.path} />
                      </svg>
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="https://azulanaite.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Sitio web"
                    className="grid h-11 w-11 place-items-center rounded-full text-secondary-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
                  >
                    <Globe className="h-[1.125rem] w-[1.125rem]" />
                  </a>
                </li>
              </ul>

              <div className="flex flex-col items-center gap-1 text-center md:items-end md:text-right">
                <a
                  href="/nahuales"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary-foreground underline-offset-4 hover:underline"
                >
                  Conoce los 20 Nahuales
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                    <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <p className="text-xs text-foreground/70">
                  © 2026 Azul Anaité · azulanaite.com
                </p>
              </div>
            </div>
          </footer>
        </div>

        {/* Lazy loaded modals - only load when needed */}
        <Suspense fallback={null}>
          {isLeadModalOpen && result && (
            <LeadCaptureModal
              isOpen={isLeadModalOpen}
              onClose={handleCloseLeadModal}
              onSubmit={handleLeadSubmit}
              isSubmitting={isSubmittingLead}
              nahualPreview={result}
            />
          )}
        </Suspense>

        <Suspense fallback={null}>
          {isResultModalOpen && (
            <MayanResultModal
              isOpen={isResultModalOpen}
              onClose={handleCloseResultModal}
              result={result}
              birthDate={selectedDate}
              cross={cross}
              onSaveByEmail={() => setIsLeadModalOpen(true)}
              leadSubmitted={leadSubmitted}
              emailSent={emailSent}
            />
          )}
        </Suspense>
      </div>
    </>
  );
};

export default Index;
