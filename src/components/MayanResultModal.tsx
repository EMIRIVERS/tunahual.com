import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { MayanKinDB, MayanCrossDB, calculateTrecena } from "@/utils/mayanCalculations";
import { useMayanData } from "@/hooks/useMayanData";
import { getNahualConocimiento } from "@/data/mayanKnowledge";
import { X, Heart, Grid3X3, BookOpen, Star, Mail, Check } from "lucide-react";
import { MayanCrossDisplay } from "./MayanCrossDisplay";
import cornIcon from "@/assets/icons/corn.svg";

// Refactored components
import { NahualHeroSection } from "./result/NahualHeroSection";
import { AnimalGuiaCard, TrecenaCard } from "./result/AnimalGuiaCard";
import { CargadorCard } from "./result/CargadorCard";
import { CARGADOR_HABILITADO } from "@/utils/cargador";
import { CualidadesRow, SombrasList } from "./result/NahualQualitiesBadges";
import { TonoSpotlightCard } from "./result/TonoSpotlightCard";
import { NahualAttributesGrid } from "./result/NahualAttributesGrid";
import { ConocimientoProfundoTab } from "./result/ConocimientoProfundoTab";
import { ShareButtons } from "./result/ShareButtons";
import { CapaBloqueada } from "./result/CapaBloqueada";
import { CieloNacimientoCard } from "./result/CieloNacimientoCard";
import { trackEvent } from "@/lib/analytics";

// Liga de pago del Mapa de Energía (Kajabi o Stripe). Sin ella, el cierre
// sigue invitando a azulanaite.com. Se define en Vercel y se hornea en el build.
const OFERTA_PDF_URL = (import.meta.env.VITE_OFERTA_PDF_URL as string | undefined)?.trim() || "";

interface MayanResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: MayanKinDB | null;
  birthDate: Date | null;
  cross: MayanCrossDB | null;
  onSaveByEmail?: () => void;
  leadSubmitted?: boolean;
  emailSent?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export function MayanResultModal({
  isOpen,
  onClose,
  result,
  birthDate,
  cross,
  onSaveByEmail,
  leadSubmitted,
  emailSent,
}: MayanResultModalProps) {
  const { nahuales, tonos } = useMayanData();

  // Get expanded knowledge for this Nahual
  const conocimientoExpandido = result ? getNahualConocimiento(result.nahual.nombre) : null;
  
  // Calculate Trecena
  const trecenaNahual = result ? calculateTrecena(result, nahuales) : null;

  const formattedDate = birthDate 
    ? birthDate.toLocaleDateString('es-GT', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
    : '';

  if (!result) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-border p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Tu Nahual Maya</DialogTitle>
        </DialogHeader>

        <motion.button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur hover:bg-muted transition-colors"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </motion.button>

        <AnimatePresence mode="wait">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6 relative"
          >
            {/* Hero Section */}
            <NahualHeroSection result={result} formattedDate={formattedDate} />

            <motion.div variants={itemVariants} className="flex items-center gap-3 px-10 -mt-2 opacity-50" aria-hidden="true">
              <div className="h-px flex-1 bg-primary/40" />
              <span className="text-primary text-xs rotate-45">◆</span>
              <div className="h-px flex-1 bg-primary/40" />
            </motion.div>

            {/* Marco: cómo se combinan el tono y el nahual de este día */}
            <motion.div
              variants={itemVariants}
              className="mx-6 p-5 rounded-2xl bg-primary/5 border-l-4 border-primary/40"
            >
              <p className="text-sm leading-relaxed text-foreground/90">
                El tono <strong className="font-medium">{result.tone.nombre}</strong> te da{" "}
                {result.tone.significado?.toLowerCase()}. El nahual{" "}
                <strong className="font-medium">{result.nahual.nombre}</strong> significa{" "}
                {result.nahual.significado?.toLowerCase()}.
              </p>
            </motion.div>

            {/* Tabs for different sections */}
            <div className="px-6 pb-6 relative z-10">
              <Tabs defaultValue="nacimiento" className="w-full">
                <TabsList className="w-full justify-start gap-6 mb-6 h-auto bg-transparent p-0 border-b border-border rounded-none">
                  <TabsTrigger
                    value="nacimiento"
                    className="text-xs sm:text-sm px-0 pb-3 rounded-none bg-transparent shadow-none border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:text-primary"
                  >
                    <Heart className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Nacimiento</span>
                    <span className="sm:hidden">Nahual</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="cruz"
                    className="text-xs sm:text-sm px-0 pb-3 rounded-none bg-transparent shadow-none border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:text-primary"
                  >
                    <Grid3X3 className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Cruz Maya</span>
                    <span className="sm:hidden">Cruz</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="profundo"
                    className="text-xs sm:text-sm px-0 pb-3 rounded-none bg-transparent shadow-none border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:text-primary"
                  >
                    <BookOpen className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Conocimiento</span>
                    <span className="sm:hidden">Más</span>
                  </TabsTrigger>
                </TabsList>

                {/* Tab: Nacimiento */}
                <TabsContent value="nacimiento" className="space-y-6 mt-0">
                  <CualidadesRow result={result} />
                  <TonoSpotlightCard result={result} />
                  <SombrasList result={result} />
                  <AnimalGuiaCard result={result} />
                  {trecenaNahual && <TrecenaCard trecenaNahual={trecenaNahual} />}
                  {birthDate && (
                    <CapaBloqueada
                      abierta={!!leadSubmitted}
                      titulo="El cielo de tu nacimiento"
                      texto="Tu luna, tu Cuenta Larga y tu cargador del año te esperan. Déjame tu correo y te los envío."
                      boton="Abrir mi cielo"
                      onAbrir={onSaveByEmail}
                    >
                      <div className="space-y-6">
                        <CieloNacimientoCard birthDate={birthDate} />
                        {CARGADOR_HABILITADO && (
                          <CargadorCard birthDate={birthDate} nahuales={nahuales} tonos={tonos} />
                        )}
                      </div>
                    </CapaBloqueada>
                  )}
                  <NahualAttributesGrid result={result} />
                  <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-[#3a1f38] to-[#1c0f1c] border border-[#5c3158]/50"
                  >
                    <img
                      src={cornIcon}
                      alt=""
                      aria-hidden="true"
                      className="absolute -bottom-6 -right-6 w-32 h-32 opacity-20 pointer-events-none"
                    />
                    <p className="eyebrow text-[#d4a574]/70 text-center mb-1">Significado</p>
                    <h4 className="font-serif text-2xl text-[#f4efc5] text-center mb-4">
                      {result.nahual.nombre}
                    </h4>
                    <p className="relative z-10 text-sm text-[#f4efc5]/85 leading-relaxed">
                      {result.nahual.descripcion}
                    </p>
                  </motion.div>
                </TabsContent>

                {/* Tab: Cruz Maya */}
                <TabsContent value="cruz" className="mt-0">
                  {cross && (
                    <CapaBloqueada
                      abierta={!!leadSubmitted}
                      titulo="Tus nueve energías te esperan"
                      texto="Déjame tu correo y te las envío: tu origen, tu destino y las energías que te acompañan."
                      boton="Abrir mi Cruz Maya"
                      onAbrir={onSaveByEmail}
                    >
                      <MayanCrossDisplay cross={cross} />
                    </CapaBloqueada>
                  )}
                </TabsContent>

                {/* Tab: Conocimiento Profundo */}
                <TabsContent value="profundo" className="mt-0">
                  {conocimientoExpandido && (
                    <ConocimientoProfundoTab
                      conocimiento={conocimientoExpandido}
                      nahualNombre={result.nahual.nombre}
                    />
                  )}
                </TabsContent>
              </Tabs>

              {/* Share and Close buttons */}
              <motion.div variants={itemVariants} className="mt-6 space-y-3">
                {/* Recibir la lectura por email (invitación, no muro) */}
                {onSaveByEmail && (
                  leadSubmitted ? (
                    <div className="rounded-2xl p-4 bg-primary/5 border border-primary/15 flex items-center justify-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary" />
                      {emailSent
                        ? "Te enviamos tu lectura a tu correo"
                        : "Tu lectura quedó guardada"}
                    </div>
                  ) : (
                    <div className="rounded-2xl p-5 bg-card/60 border border-border/60 text-center space-y-3">
                      <p className="font-serif text-xl text-foreground">
                        Guarda tu lectura
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Te la enviamos por correo para que vuelvas a tu mapa maya
                        cuando lo necesites.
                      </p>
                      <Button
                        onClick={onSaveByEmail}
                        variant="cta"
                        className="w-full rounded-full py-6 text-base font-medium gap-2"
                      >
                        <Mail className="w-5 h-5" />
                        Recibir mi lectura por email
                      </Button>
                    </div>
                  )
                )}

                <ShareButtons result={result} cross={cross} />
                <motion.div
                  variants={itemVariants}
                  className="rounded-2xl p-6 bg-card/60 border border-border/60 text-center flex flex-col items-center gap-3"
                >
                  <Star className="w-5 h-5 text-primary/70" />
                  <p className="font-serif text-xl text-foreground">
                    {OFERTA_PDF_URL ? "Tu Mapa de Energía" : "Tu camino apenas comienza"}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                    {OFERTA_PDF_URL
                      ? `Tu nahual, tu tono, tu cruz y tu huella energética en un PDF personal de ${result.tone.numero} ${result.nahual.nombre}, que llega a tu correo.`
                      : "La tradición maya k'iche' es vasta. En Azul Anaité acompañamos a quienes desean caminarla con profundidad."}
                  </p>
                  <a
                    href={OFERTA_PDF_URL || "https://azulanaite.com"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackEvent(OFERTA_PDF_URL ? "oferta_pdf_click" : "azulanaite_click", {
                        nahual: result.nahual.nombre,
                        tono: result.tone.numero,
                      })
                    }
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary border-b border-primary/40 pb-0.5 hover:border-primary transition-colors mt-1"
                  >
                    {OFERTA_PDF_URL ? "Quiero mi Mapa de Energía" : "Conoce Azul Anaité"}
                    <span aria-hidden>→</span>
                  </a>
                </motion.div>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full rounded-full py-6 text-base font-medium"
                >
                  Cerrar
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
