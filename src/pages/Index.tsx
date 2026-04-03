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
import logo from "@/assets/logo-azul-anaite.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SocialProofCounter } from "@/components/SocialProofCounter";

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
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  
  const { toast } = useToast();

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
        setIsLeadModalOpen(true);
      }, 1500);
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(calculate, { timeout: 100 });
    } else {
      setTimeout(calculate, 0);
    }
  }, [birthDate, nahuales, tonos]);

  const handleLeadSubmit = useCallback(async (
    nombre: string,
    email: string,
    telefono: string
  ) => {
    if (!result || !selectedDate) return;

    setIsSubmittingLead(true);

    try {
      const kinCompleto = `${result.tone.numero} ${result.nahual.nombre}`;

      // Try insert first; if email already exists (duplicate), just continue
      const { error } = await supabase.from("leads").insert({
        nombre,
        email,
        telefono,
        fecha_nacimiento: birthDate,
        nahual: result.nahual.nombre,
        tono: result.tone.numero,
        kin_completo: kinCompleto,
      });

      // Ignore duplicate email error (code 23505) - user already registered, that's fine
      if (error && error.code !== '23505') throw error;

      // Sync to AZUL ANAITÉ OS (non-blocking, server-side via API route)
      fetch("/api/sync-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          email,
          telefono,
          nahual: result.nahual.nombre,
          tono: result.tone.numero,
          kin_completo: kinCompleto,
          fecha_nacimiento: birthDate,
        }),
      }).catch(console.error);

      // Send to Zapier webhook if configured (non-blocking)
      supabase
        .from("configuracion")
        .select("valor")
        .eq("clave", "zapier_webhook_url")
        .single()
        .then(({ data: config }) => {
          if (config?.valor) {
            fetch(config.valor, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              mode: "no-cors",
              body: JSON.stringify({
                nombre,
                email,
                telefono,
                fecha_nacimiento: birthDate,
                nahual: result.nahual.nombre,
                tono: result.tone.numero,
                kin_completo: kinCompleto,
                timestamp: new Date().toISOString(),
              }),
            }).catch(console.error);
          }
        });

      
      setIsLeadModalOpen(false);
      setIsResultModalOpen(true);

      toast({
        title: "¡Datos guardados!",
        description: "Ahora puedes ver tu lectura.",
      });
    } catch (error) {
      console.error("Error saving lead:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar tus datos. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingLead(false);
    }
  }, [result, selectedDate, birthDate, toast]);

  const handleCloseLeadModal = useCallback(() => setIsLeadModalOpen(false), []);
  const handleCloseResultModal = useCallback(() => setIsResultModalOpen(false), []);

  // Show form immediately - don't wait for data to load (improves LCP)
  const isButtonDisabled = !birthDate || loadingData || nahuales.length === 0;

  return (
    <>
      <Helmet>
        <title>Calculadora Maya Gratis: Descubre tu Nahual y Signo Maya | Cholq'ij</title>
        <meta name="description" content="Calcula tu Nahual Maya GRATIS por fecha de nacimiento. Descubre tu signo del calendario sagrado Cholq'ij, tu Tono y tu Cruz Maya completa de 9 posiciones." />
        <link rel="canonical" href="https://tunahual.com/" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tunahual.com/" />
        <meta property="og:title" content="Calculadora Maya Gratis: Descubre tu Nahual y Signo Maya" />
        <meta property="og:description" content="Calcula tu Nahual Maya GRATIS por fecha de nacimiento. Descubre tu signo del calendario sagrado Cholq'ij, tu Tono y tu Cruz Maya completa." />
        <meta property="og:image" content="https://tunahual.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="es_ES" />
        <meta property="og:site_name" content="Tu Nahual - Calculadora Maya" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://tunahual.com/" />
        <meta name="twitter:title" content="Calculadora Maya Gratis: Descubre tu Nahual y Signo Maya" />
        <meta name="twitter:description" content="Calcula tu Nahual Maya GRATIS por fecha de nacimiento. Descubre tu signo del calendario sagrado Cholq'ij." />
        <meta name="twitter:image" content="https://tunahual.com/og-image.png" />
        
        {/* Additional SEO */}
        <meta name="keywords" content="nahual maya, calculadora maya, signo maya, cholqij, calendario maya, horóscopo maya, cruz maya, tono maya" />
        <meta name="author" content="Azul Anaité" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="fixed inset-0 bg-background flex flex-col touch-manipulation index-bg">
        {/* Overlay - simplified, no blur for better performance */}
        <div className="absolute inset-0 bg-background/90 pointer-events-none" />

        {/* Header - removed backdrop-blur for better INP */}
        <header 
          className="shrink-0 z-50 bg-background/95 border-b border-border/50 relative" 
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div 
            className="max-w-lg mx-auto px-4 py-2 flex items-center justify-between" 
            style={{ 
              paddingLeft: 'max(1rem, env(safe-area-inset-left))', 
              paddingRight: 'max(1rem, env(safe-area-inset-right))' 
            }}
          >
            <a
              href="https://azulanaite.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Azul Anaité</span>
            </a>
            <img
              src={logo}
              alt="Azul Anaité"
              className="h-20 w-auto"
              width={280}
              height={80}
              loading="eager"
              fetchPriority="high"
            />
            <div className="w-16" />
          </div>
        </header>

        {/* Main Content - Always show form, no AnimatePresence */}
        <main className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center px-4 py-2 relative z-10">
          {isCalculating ? (
            /* Simple CSS-based loader instead of heavy PyramidLoader */
            <div className="w-full max-w-md">
              <div className="bg-card rounded-3xl p-6 shadow-sm border border-border/50">
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="relative w-16 h-16 mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                    <Calendar className="absolute inset-0 m-auto w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Consultando el calendario sagrado...
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-[min(28rem,calc(100vw-2rem))] space-y-4 animate-fade-in">
              {/* Welcome Section */}
              <div className="text-center space-y-3">
                <h1 className="text-xl sm:text-3xl font-bold text-foreground tracking-tight">
                  Descubre tu Nahual
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
                  Ingresa tu fecha de nacimiento para calcular tu signo maya{" "}
                  <span className="font-semibold text-primary">GRATIS</span> en el calendario sagrado Cholq'ij
                </p>

                {/* Social Proof Counter */}
                <SocialProofCounter baseCount={10000} />
              </div>

              {/* Why it matters section - optimized */}
              <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border border-primary/30 rounded-xl p-4 text-left space-y-2 shadow-lg">
                <h2 className="text-sm sm:text-base font-semibold text-primary">
                  ¿Por qué conocer tu Nahual?
                </h2>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  La energía del día que naciste revela información
                  importante. Es el mapa para que recuerdes quién eres, a qué
                  has venido, descubras cuáles son tus dones, virtudes y
                  desafíos en la vida.
                </p>
                <p className="text-sm text-muted-foreground italic border-l-2 border-primary/40 pl-3">
                  Te muestra un mapa preciso para que recuerdes quién naciste
                  siendo.
                </p>
              </div>

              {/* Calculator Card */}
              <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/50">
                <div className="space-y-3">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 rounded-full border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-sm"
                      max={maxDate}
                    />
                  </div>
                  <Button
                    onClick={handleCalculate}
                    disabled={isButtonDisabled}
                    variant={birthDate ? "cta" : "default"}
                    className="w-full rounded-full py-5 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
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
                      className="w-full text-muted-foreground"
                      onClick={() => {
                        setResult(null);
                        setCross(null);
                        setSelectedDate(null);
                        setBirthDate("");
                      }}
                    >
                      ← Calcular otra fecha
                    </Button>
                  )}
                </div>
              </div>

              {/* Contextual date energy */}
              <p className="text-center text-xs text-muted-foreground">
                La energía de hoy influye en tu lectura
              </p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer
          className="shrink-0 max-w-lg mx-auto px-4 py-3 text-center relative z-10"
          style={{
            paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
            paddingLeft: 'max(1rem, env(safe-area-inset-left))',
            paddingRight: 'max(1rem, env(safe-area-inset-right))',
          }}
        >
          {/* Social icons row */}
          <div className="flex items-center justify-center gap-3 mb-2">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/azulanaite/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 hover:opacity-80 hover:scale-110 transition-all duration-200"
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/Azulanaite/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-[#1877F2] hover:opacity-80 hover:scale-110 transition-all duration-200"
              aria-label="Facebook"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@azulanaite13"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-black hover:opacity-80 hover:scale-110 transition-all duration-200"
              aria-label="TikTok"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
            </a>

            {/* Spotify */}
            <a
              href="https://open.spotify.com/show/26LpXjwLXlQ1Fe06kfEoRT"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-[#1DB954] hover:opacity-80 hover:scale-110 transition-all duration-200"
              aria-label="Spotify"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
            </a>

            {/* Website */}
            <a
              href="https://azulanaite.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-full border border-primary/40 bg-primary/10 hover:bg-primary/20 hover:scale-110 transition-all duration-200"
              aria-label="Sitio web"
            >
              <Globe className="w-4 h-4 text-primary" />
            </a>
          </div>

          {/* Nahuales link */}
          <a
            href="/nahuales"
            className="text-xs text-primary hover:underline block mb-1"
          >
            Conoce los 20 Nahuales →
          </a>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            © 2025 Azul Anaité · azulanaite.com
          </p>
        </footer>

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
            />
          )}
        </Suspense>
      </div>
    </>
  );
};

export default Index;
