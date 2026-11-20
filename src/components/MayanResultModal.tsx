import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { MayanKinDB, MayanCrossDB, calculateTrecena } from "@/utils/mayanCalculations";
import { useMayanData } from "@/hooks/useMayanData";
import { getResumenConocimiento } from "@/data/mayanKnowledge";
import { X, Heart, Grid3X3, BookOpen, Star, Mail, Check, ArrowRight } from "lucide-react";
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
import { ComprarMapa } from "./result/ComprarMapa";
import { CHECKOUT_MAPA_HABILITADO } from "@/lib/checkoutMapa";
import { nahualToSlug } from "@/data/nahualSlugs";
import { primeraFrase } from "@/lib/lectura";

// Liga de pago del Mapa de Energía (Kajabi o Stripe), alternativa al cobro
// propio (VITE_CHECKOUT_MAPA). Se define en Vercel y se hornea en el build.
const OFERTA_PDF_URL = (import.meta.env.VITE_OFERTA_PDF_URL as string | undefined)?.trim() || "";
// Sin cobro ni liga, la tarjeta del Mapa queda en «Muy pronto» y solo pide el correo para avisar.
const MAPA_A_LA_VENTA = CHECKOUT_MAPA_HABILITADO || !!OFERTA_PDF_URL;

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

  // Resumen del conocimiento profundo (la interpretación extensa no se publica)
  const resumenConocimiento = result ? getResumenConocimiento(result.nahual.nombre) : null;
  
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

            {/* Lo que se lee sin dejar datos: glifo y elemento, y una frase del nahual */}
            <motion.div
              variants={itemVariants}
              className="mx-6 p-5 rounded-2xl bg-primary/5 border-l-4 border-primary/40 space-y-2"
            >
              <p className="eyebrow text-foreground/70">
                Glifo {result.nahual.animal_guia} · Elemento {result.nahual.elemento}
              </p>
              <p className="text-sm leading-relaxed text-foreground/90">
                {primeraFrase(result.nahual.descripcion)}
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
                  <TonoSpotlightCard result={result} breve />
                  <CapaBloqueada
                    abierta={!!leadSubmitted}
                    titulo="Tu lectura completa te espera"
                    texto="Tu animal guía, tus cualidades, tu trecena y el cielo de tu nacimiento. Déjame tu correo y te los envío."
                    boton="Abrir mi lectura"
                    onAbrir={onSaveByEmail}
                    vistaPrevia
                  >
                    <div className="space-y-6">
                      <CualidadesRow result={result} />
                      <SombrasList result={result} />
                      <AnimalGuiaCard result={result} />
                      {trecenaNahual && <TrecenaCard trecenaNahual={trecenaNahual} />}
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
                      {birthDate && (
                        <div className="space-y-6">
                          <CieloNacimientoCard birthDate={birthDate} />
                          {CARGADOR_HABILITADO && (
                            <CargadorCard birthDate={birthDate} nahuales={nahuales} tonos={tonos} />
                          )}
                        </div>
                      )}
                    </div>
                  </CapaBloqueada>
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
                <TabsContent value="profundo" className="mt-0 space-y-6">
                  {resumenConocimiento && (
                    <CapaBloqueada
                      abierta={!!leadSubmitted}
                      titulo={`El conocimiento de ${result.nahual.nombre}`}
                      texto="Un resumen de su significado, su mensaje y su luz. Déjame tu correo y te lo envío."
                      boton="Abrir el resumen"
                      onAbrir={onSaveByEmail}
                    >
                      <ConocimientoProfundoTab
                        resumen={resumenConocimiento}
                        nahualNombre={result.nahual.nombre}
                      />
                    </CapaBloqueada>
                  )}
                  {/* La interpretación extensa no se publica: vive en el Mapa (tarjeta del cierre) */}
                  <div className="rounded-2xl p-5 bg-card/60 border border-border/60 text-center space-y-2">
                    <p className="eyebrow text-primary/80">La lectura extensa</p>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                      {MAPA_A_LA_VENTA
                        ? `La interpretación extensa de ${result.nahual.nombre} no se publica en esta página: llega en tu Mapa de Energía.`
                        : `La interpretación extensa de ${result.nahual.nombre} no se publica en esta página: será parte de tu Mapa de Energía.`}
                    </p>
                    <a
                      href="#mapa-energia"
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById("mapa-energia")?.scrollIntoView({ behavior: "smooth", block: "center" });
                      }}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary border-b border-primary/40 pb-0.5 hover:border-primary transition-colors"
                    >
                      {MAPA_A_LA_VENTA ? "Quiero mi Mapa de Energía" : "Conocer el Mapa"}
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </a>
                  </div>
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
                  id="mapa-energia"
                  variants={itemVariants}
                  className="rounded-2xl p-6 bg-card/60 border border-border/60 text-center flex flex-col items-center gap-3"
                >
                  <Star className="w-5 h-5 text-primary/70" aria-hidden="true" />
                  {!MAPA_A_LA_VENTA && <p className="eyebrow text-primary/80 -mb-1">Muy pronto</p>}
                  <p className="font-serif text-2xl text-foreground">Tu Mapa de Energía</p>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                    {`La lectura personal de ${result.tone.numero} ${result.nahual.nombre} con tu nombre y tu fecha de nacimiento, tu cruz de nueve energías y su interpretación extensa, en 24 páginas que llegan a tu correo.`}
                  </p>
                  {CHECKOUT_MAPA_HABILITADO ? (
                    <ComprarMapa
                      nahual={result.nahual.nombre}
                      nahualSlug={nahualToSlug[result.nahual.nombre] || result.nahual.nombre.toLowerCase()}
                      tono={result.tone.numero}
                      birthDate={birthDate}
                    />
                  ) : OFERTA_PDF_URL ? (
                    <a
                      href={OFERTA_PDF_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackEvent("oferta_pdf_click", {
                          nahual: result.nahual.nombre,
                          tono: result.tone.numero,
                        })
                      }
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary border-b border-primary/40 pb-0.5 hover:border-primary transition-colors mt-1"
                    >
                      Quiero mi Mapa de Energía
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </a>
                  ) : leadSubmitted ? (
                    <p className="text-sm text-foreground/80 flex items-start justify-center gap-2 text-left max-w-xs">
                      <Check className="w-4 h-4 text-primary" aria-hidden="true" />
                      Te avisaremos a tu correo cuando esté listo.
                    </p>
                  ) : onSaveByEmail ? (
                    <Button
                      onClick={onSaveByEmail}
                      variant="outline"
                      className="rounded-full px-6 py-5 text-sm font-medium gap-2 border-primary/40 text-primary hover:bg-primary/5"
                    >
                      <Mail className="w-4 h-4" aria-hidden="true" />
                      Avisarme cuando esté listo
                    </Button>
                  ) : null}
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
