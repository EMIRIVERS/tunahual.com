import { memo } from "react";
import { motion } from "framer-motion";
import { MayanKinDB } from "@/utils/mayanCalculations";
import { Badge } from "@/components/ui/badge";
import { Star, Compass, Leaf } from "lucide-react";

interface FreeResultContentProps {
  result: MayanKinDB;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const FreeResultContent = memo(function FreeResultContent({ result }: FreeResultContentProps) {
  // Show only first 3 qualities (limited version)
  const limitedQualities = result.nahual.cualidades?.slice(0, 3) || [];
  const toneQualities = result.tone.cualidades?.slice(0, 2) || [];
  
  return (
    <motion.div
      variants={itemVariants}
      className="space-y-4"
    >
      {/* Animal Guía - Limited */}
      <motion.div
        variants={itemVariants}
        className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tu Animal Guía</p>
            <p className="font-semibold text-foreground">{result.nahual.animal_guia}</p>
          </div>
        </div>
      </motion.div>

      {/* Limited Qualities */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          Tus Cualidades Principales
        </h4>
        <div className="flex flex-wrap gap-2">
          {limitedQualities.map((cualidad, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20"
            >
              {cualidad}
            </Badge>
          ))}
          {result.nahual.cualidades && result.nahual.cualidades.length > 3 && (
            <Badge variant="outline" className="border-dashed opacity-50">
              +{result.nahual.cualidades.length - 3} más...
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Tone Qualities - Limited */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Star className="w-4 h-4 text-primary" />
          Cualidades del Tono {result.tone.numero}
        </h4>
        <div className="flex flex-wrap gap-2">
          {toneQualities.map((cualidad, index) => (
            <Badge
              key={index}
              variant="outline"
              className="border-primary/30 text-foreground"
            >
              {cualidad}
            </Badge>
          ))}
          {result.tone.cualidades && result.tone.cualidades.length > 2 && (
            <Badge variant="outline" className="border-dashed opacity-50">
              +{result.tone.cualidades.length - 2} más...
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Basic Info Grid */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-2 gap-3"
      >
        <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
          <p className="text-xs text-muted-foreground">Punto Cardinal</p>
          <div className="flex items-center gap-2 mt-1">
            <Compass className="w-4 h-4 text-primary" />
            <p className="text-sm font-medium text-foreground">{result.nahual.punto_cardinal}</p>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
          <p className="text-xs text-muted-foreground">Elemento</p>
          <div className="flex items-center gap-2 mt-1">
            <Leaf className="w-4 h-4 text-primary" />
            <p className="text-sm font-medium text-foreground">{result.nahual.elemento}</p>
          </div>
        </div>
      </motion.div>

      {/* Brief Description */}
      <motion.div
        variants={itemVariants}
        className="p-4 rounded-xl bg-muted/30 border border-border/30"
      >
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {result.nahual.descripcion}
        </p>
        <p className="text-xs text-primary mt-2 font-medium">
          Desbloquea tu lectura completa para ver más...
        </p>
      </motion.div>
    </motion.div>
  );
});
