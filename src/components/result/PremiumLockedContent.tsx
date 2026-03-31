import { memo } from "react";
import { motion } from "framer-motion";
import { Lock, Star, BookOpen, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PremiumLockedContentProps {
  onUnlock: () => void;
  isLoading?: boolean;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const PremiumLockedContent = memo(function PremiumLockedContent({ 
  onUnlock, 
  isLoading 
}: PremiumLockedContentProps) {
  return (
    <motion.div
      variants={itemVariants}
      className="space-y-6"
    >
      {/* Locked Cruz Maya Preview */}
      <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6 overflow-hidden">
        {/* Blur overlay */}
        <div className="absolute inset-0 backdrop-blur-sm bg-background/60 z-10 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-center space-y-3"
          >
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Cruz Maya Completa</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              9 posiciones que revelan tu misión, ancestros y destino
            </p>
          </motion.div>
        </div>
        
        {/* Blurred content preview */}
        <div className="grid grid-cols-3 gap-4 opacity-30">
          {[...Array(9)].map((_, i) => (
            <div 
              key={i} 
              className="aspect-square rounded-xl bg-muted flex items-center justify-center"
            >
              <Grid3X3 className="w-8 h-8 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>

      {/* What's included in Premium */}
      <div className="space-y-4">
        <h4 className="text-center font-semibold text-foreground flex items-center justify-center gap-2">
          Desbloquea tu Lectura Completa
        </h4>
        
        <div className="grid gap-3">
          {[
            { icon: Grid3X3, text: "Cruz Maya de 9 posiciones con significados profundos" },
            { icon: BookOpen, text: "Ceremonias, rituales y trabajo espiritual personalizado" },
            { icon: Star, text: "Polaridades positivas y negativas de tu energía" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border/50"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Price and CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center space-y-4"
      >
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground line-through">Valor: $47 USD</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-bold text-primary">$1.99</span>
            <span className="text-muted-foreground">USD</span>
          </div>
          <p className="text-xs text-muted-foreground">Acceso permanente a tu lectura</p>
        </div>

        <Button
          onClick={onUnlock}
          disabled={isLoading}
          variant="cta"
          size="lg"
          className="w-full rounded-full py-6 text-base font-semibold gap-2"
        >
          {isLoading ? "Redirigiendo a pago seguro..." : "Desbloquear por $1.99 USD"}
        </Button>

        <p className="text-xs text-muted-foreground">
          Pago seguro • Acceso inmediato
        </p>
      </motion.div>
    </motion.div>
  );
});
