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
import { Calendar, ArrowLeft, Loader2 } from "lucide-react";
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
          className="shrink-0 max-w-lg mx-auto px-4 py-3 text-center relative z-10 space-y-1" 
          style={{ 
            paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))', 
            paddingLeft: 'max(1rem, env(safe-area-inset-left))', 
            paddingRight: 'max(1rem, env(safe-area-inset-right))' 
          }}
        >
          <a 
            href="/nahuales" 
            className="text-xs text-primary hover:underline block"
          >
            Conoce los 20 Nahuales →
          </a>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Azul Anaité
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
