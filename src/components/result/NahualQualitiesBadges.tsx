import { memo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MayanKinDB } from "@/utils/mayanCalculations";

interface NahualQualitiesBadgesProps {
  result: MayanKinDB;
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export const NahualQualitiesBadges = memo(function NahualQualitiesBadges({ 
  result 
}: NahualQualitiesBadgesProps) {
  return (
    <>
      {/* Cualidades del Nahual */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h4 className="font-semibold text-foreground">
          Cualidades del Nahual {result.nahual.nombre}
        </h4>
        <div className="flex flex-wrap gap-2">
          {result.nahual.cualidades?.map((cualidad, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i, type: "spring" }}
              whileHover={{ scale: 1.1 }}
            >
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                {cualidad}
              </Badge>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Aspectos a Trabajar (Sombras) */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Aspectos a Trabajar
        </h4>
        <div className="flex flex-wrap gap-2">
          {result.nahual.sombras?.map((sombra, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i, type: "spring" }}
              whileHover={{ scale: 1.1 }}
            >
              <Badge variant="outline" className="rounded-full px-3 py-1 border-amber-500/30 text-amber-700 dark:text-amber-400">
                {sombra}
              </Badge>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Cualidades del Tono */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <motion.span 
            className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-secondary-foreground"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {result.tone.numero}
          </motion.span>
          Potencia {result.tone.numero} - {result.tone.nombre} ({result.tone.significado})
        </h4>
        <div className="flex flex-wrap gap-2">
          {result.tone.cualidades?.map((cualidad, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i, type: "spring" }}
              whileHover={{ scale: 1.1 }}
            >
              <Badge variant="outline" className="rounded-full px-3 py-1">
                {cualidad}
              </Badge>
            </motion.div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{result.tone.descripcion}</p>
      </motion.div>
    </>
  );
});
