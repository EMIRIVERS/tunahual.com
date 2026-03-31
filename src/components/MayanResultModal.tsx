import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { MayanKinDB, MayanCrossDB, calculateTrecena } from "@/utils/mayanCalculations";
import { useMayanData } from "@/hooks/useMayanData";
import { getNahualConocimiento } from "@/data/mayanKnowledge";
import { X, Heart, Grid3X3, BookOpen } from "lucide-react";
import { MayanCrossDisplay } from "./MayanCrossDisplay";
import { OptimizedParticles, OptimizedGlowingOrbs } from "./OptimizedParticles";

// Refactored components
import { NahualHeroSection } from "./result/NahualHeroSection";
import { AnimalGuiaCard, TrecenaCard } from "./result/AnimalGuiaCard";
import { NahualQualitiesBadges } from "./result/NahualQualitiesBadges";
import { NahualAttributesGrid } from "./result/NahualAttributesGrid";
import { ConocimientoProfundoTab } from "./result/ConocimientoProfundoTab";
import { ShareButtons } from "./result/ShareButtons";

interface MayanResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: MayanKinDB | null;
  birthDate: Date | null;
  cross: MayanCrossDB | null;
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
}: MayanResultModalProps) {
  const { nahuales } = useMayanData();

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
            {/* Background effects */}
            <OptimizedParticles />
            <OptimizedGlowingOrbs />

            {/* Hero Section */}
            <NahualHeroSection result={result} formattedDate={formattedDate} />

            {/* Tabs for different sections */}
            <div className="px-6 pb-6 relative z-10">
              <Tabs defaultValue="nacimiento" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="nacimiento" className="text-xs sm:text-sm">
                    <Heart className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Nacimiento</span>
                    <span className="sm:hidden">Nahual</span>
                  </TabsTrigger>
                  <TabsTrigger value="cruz" className="text-xs sm:text-sm">
                    <Grid3X3 className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Cruz Maya</span>
                    <span className="sm:hidden">Cruz</span>
                  </TabsTrigger>
                  <TabsTrigger value="profundo" className="text-xs sm:text-sm">
                    <BookOpen className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Conocimiento</span>
                    <span className="sm:hidden">Más</span>
                  </TabsTrigger>
                </TabsList>

                {/* Tab: Nacimiento */}
                <TabsContent value="nacimiento" className="space-y-6 mt-0">
                  <AnimalGuiaCard result={result} />
                  {trecenaNahual && <TrecenaCard trecenaNahual={trecenaNahual} />}
                  <NahualQualitiesBadges result={result} />
                  <NahualAttributesGrid result={result} />
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    className="p-4 rounded-2xl bg-primary/5 border border-primary/10"
                  >
                    <h4 className="font-semibold text-foreground mb-3">Significado de {result.nahual.nombre}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {result.nahual.descripcion}
                    </p>
                  </motion.div>
                </TabsContent>

                {/* Tab: Cruz Maya */}
                <TabsContent value="cruz" className="mt-0">
                  {cross && <MayanCrossDisplay cross={cross} />}
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
                <ShareButtons result={result} cross={cross} />
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
