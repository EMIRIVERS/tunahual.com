import { memo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { NahualImage } from "../NahualImage";
import { MayanKinDB } from "@/utils/mayanCalculations";
import lagoAtitlanBg from "@/assets/lago-atitlan-bg.jpg";

interface NahualHeroSectionProps {
  result: MayanKinDB;
  formattedDate: string;
}

// Simplified animated glyph wrapper - without background
const AnimatedGlyph = memo(function AnimatedGlyph({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="relative"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
});

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export const NahualHeroSection = memo(function NahualHeroSection({ 
  result, 
  formattedDate 
}: NahualHeroSectionProps) {
  return (
    <>
      {/* Link to Azul Anaité */}
      <motion.div variants={itemVariants} className="px-6 pt-6 relative z-20">
        <a 
          href="https://azulanaite.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm drop-shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Azul Anaité</span>
        </a>
      </motion.div>

      {/* Hero Section with Glyph and Lake Atitlan background */}
      <motion.div 
        variants={itemVariants}
        className="relative border-b border-border/50 overflow-hidden"
      >
        {/* Background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${lagoAtitlanBg})` }}
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/80" />
        
        <div className="flex flex-col items-center py-8 px-6 relative z-10">
          <AnimatedGlyph>
            <NahualImage
              animalGuia={result.nahual.animal_guia}
              nahualName={result.nahual.nombre}
              type="glifo"
              className="w-32 h-32 mb-4 relative z-10"
            />
          </AnimatedGlyph>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-foreground/80 mb-1 drop-shadow-sm"
          >
            {formattedDate}
          </motion.p>
          
          <motion.div
            className="flex items-baseline gap-3"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          >
            <span className="font-serif text-6xl font-semibold text-primary drop-shadow-md">
              {result.tone.numero}
            </span>
            <span className="font-serif text-5xl font-semibold text-foreground drop-shadow-md">{result.nahual.nombre}</span>
          </motion.div>

          <motion.p
            className="text-base text-foreground/80 mt-2 tracking-wide drop-shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {result.tone.nombre} • {result.nahual.significado}
          </motion.p>
        </div>
      </motion.div>
    </>
  );
});
