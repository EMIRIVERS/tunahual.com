import { memo } from "react";
import { NahualImage } from "./NahualImage";
import { MayanKinDB } from "@/utils/mayanCalculations";
import { motion } from "framer-motion";

interface NahualPreviewProps {
  result: MayanKinDB;
}

export const NahualPreview = memo(function NahualPreview({ result }: NahualPreviewProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border border-primary/20 p-4"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
      
      <div className="relative z-10 flex items-center gap-4">
        {/* Glyph */}
        <div className="relative shrink-0">
          <div className="absolute -inset-1 bg-primary/20 rounded-full blur-md animate-pulse-slow" />
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-card border-2 border-primary/30">
            <NahualImage 
              animalGuia={result.nahual.animal_guia}
              nahualName={result.nahual.nombre}
              type="glifo"
              className="w-full h-full"
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-primary/70 text-[0.65rem] uppercase tracking-[0.2em] font-medium mb-1">
            <span>Tu Nahual</span>
          </div>
          <h3 className="font-serif text-2xl font-semibold text-foreground truncate leading-tight">
            {result.tone.numero} {result.nahual.nombre}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {result.nahual.significado}
          </p>
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
    </motion.div>
  );
});
