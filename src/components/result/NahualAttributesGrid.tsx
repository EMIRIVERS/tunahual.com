import { memo } from "react";
import { motion } from "framer-motion";
import { Compass, Heart, MapPin } from "lucide-react";
import { MayanKinDB } from "@/utils/mayanCalculations";

interface NahualAttributesGridProps {
  result: MayanKinDB;
}

const cardinalColors: Record<string, string> = {
  "Norte": "bg-white text-black border border-border",
  "Sur": "bg-yellow-400 text-black",
  "Este": "bg-red-500 text-white",
  "Oeste": "bg-gray-800 text-white",
};

const maizColors: Record<string, string> = {
  "Blanco": "bg-white border-2 border-gray-200",
  "Negro": "bg-gray-900",
  "Amarillo": "bg-yellow-400",
  "Rojo": "bg-red-500",
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export const NahualAttributesGrid = memo(function NahualAttributesGrid({ 
  result 
}: NahualAttributesGridProps) {
  return (
    <>
      {/* Grid de Atributos */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        {/* Punto Cardinal */}
        <motion.div 
          className="p-4 rounded-xl bg-card border border-border/50"
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Compass className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Punto Cardinal</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.div 
              className={`w-4 h-4 rounded-full ${cardinalColors[result.nahual.punto_cardinal] || 'bg-muted'}`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="font-medium">{result.nahual.punto_cardinal}</span>
          </div>
        </motion.div>

        {/* Color del Maíz */}
        <motion.div 
          className="p-4 rounded-xl bg-card border border-border/50"
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <p className="text-xs text-muted-foreground mb-2">Color del Maíz</p>
          <div className="flex items-center gap-2">
            <motion.div 
              className={`w-4 h-4 rounded-full ${maizColors[result.nahual.color_maiz] || 'bg-muted'}`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
            <span className="font-medium">{result.nahual.color_maiz}</span>
          </div>
        </motion.div>

        {/* Elemento */}
        <motion.div 
          className="p-4 rounded-xl bg-card border border-border/50"
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <p className="text-xs text-muted-foreground mb-2">Elemento</p>
          <span className="font-medium">{result.nahual.elemento}</span>
        </motion.div>

        {/* Parte del Cuerpo */}
        <motion.div 
          className="p-4 rounded-xl bg-card border border-border/50"
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Rige</span>
          </div>
          <span className="font-medium">{result.nahual.parte_cuerpo}</span>
        </motion.div>
      </motion.div>

      {/* Lugar del Poder y Elemento de Conexión */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        <motion.div 
          className="p-4 rounded-xl bg-card border border-border/50"
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Lugar del Poder</span>
          </div>
          <span className="font-medium text-sm">{result.nahual.lugar_poder}</span>
        </motion.div>

        <motion.div 
          className="p-4 rounded-xl bg-card border border-border/50"
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <p className="text-xs text-muted-foreground mb-2">Elemento de Conexión</p>
          <span className="font-medium text-sm">{result.nahual.elemento_conexion}</span>
        </motion.div>
      </motion.div>
    </>
  );
});
