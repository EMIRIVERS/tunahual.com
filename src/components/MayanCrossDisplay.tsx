import { motion, AnimatePresence } from "framer-motion";
import { MayanCrossDB, CrossPositionDB } from "@/utils/mayanCalculations";
import { NahualImage } from "./NahualImage";
import { useState } from "react";
import { X, AlertTriangle, Compass, MapPin } from "lucide-react";
import { Badge } from "./ui/badge";
interface MayanCrossDisplayProps {
  cross: MayanCrossDB;
}
type CardVariant = 'red' | 'yellow' | 'green' | 'greenCenter' | 'white' | 'black';
const variantStyles: Record<CardVariant, string> = {
  red: 'bg-white border-4 border-red-500 rounded-2xl',
  yellow: 'bg-white border-4 border-yellow-400 rounded-2xl',
  green: 'bg-emerald-700 border-0 rounded-xl',
  greenCenter: 'bg-emerald-700 border-4 border-purple-500 rounded-xl',
  white: 'bg-white border-2 border-gray-300 rounded-2xl',
  black: 'bg-white border-4 border-gray-900 rounded-2xl'
};
const cardinalColors: Record<string, string> = {
  "Norte": "bg-white text-black border border-border",
  "Sur": "bg-yellow-400 text-black",
  "Este": "bg-red-500 text-white",
  "Oeste": "bg-gray-800 text-white"
};

// Modal para mostrar info del Nahual
const NahualInfoModal = ({
  position,
  onClose
}: {
  position: CrossPositionDB;
  onClose: () => void;
}) => {
  const nahual = position.kin.nahual;
  const tone = position.kin.tone;
  return <motion.div initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} exit={{
    opacity: 0
  }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{
      scale: 0.9,
      opacity: 0
    }} animate={{
      scale: 1,
      opacity: 1
    }} exit={{
      scale: 0.9,
      opacity: 0
    }} onClick={e => e.stopPropagation()} className="bg-background border border-border rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NahualImage animalGuia={nahual.animal_guia} nahualName={nahual.nombre} type="glifo" className="w-12 h-12" />
            <div>
              <h3 className="font-bold text-lg">{tone.numero} {nahual.nombre}</h3>
              <p className="text-xs text-muted-foreground">{nahual.significado}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Position meaning */}
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-xs font-medium text-primary mb-1">{position.position}</p>
            <p className="text-sm text-muted-foreground">{position.meaning}</p>
          </div>

          {/* Tono info */}
          <div className="p-3 rounded-xl bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Tono {tone.numero} - {tone.nombre}</p>
            <p className="text-sm">{tone.significado}</p>
          </div>

          {/* Cualidades */}
          {nahual.cualidades && nahual.cualidades.length > 0 && <div className="space-y-2">
              <h4 className="text-sm font-medium">
                Cualidades
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {nahual.cualidades.map((c, i) => <Badge key={i} variant="secondary" className="text-xs">{c}</Badge>)}
              </div>
            </div>}

          {/* Sombras */}
          {nahual.sombras && nahual.sombras.length > 0 && <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Aspectos a Trabajar
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {nahual.sombras.map((s, i) => <Badge key={i} variant="outline" className="text-xs border-amber-500/30 text-amber-700 dark:text-amber-400">{s}</Badge>)}
              </div>
            </div>}

          {/* Atributos */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-card border border-border/50">
              <div className="flex items-center gap-1.5 mb-1">
                <Compass className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Punto Cardinal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full ${cardinalColors[nahual.punto_cardinal] || 'bg-muted'}`} />
                <span className="text-sm font-medium">{nahual.punto_cardinal}</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Elemento</p>
              <span className="text-sm font-medium">{nahual.elemento}</span>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border/50">
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Lugar del Poder</span>
              </div>
              <span className="text-sm font-medium">{nahual.lugar_poder}</span>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Animal Guía</p>
              <span className="text-sm font-medium">{nahual.animal_guia}</span>
            </div>
          </div>

          {/* Descripción */}
          <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
            <p className="text-sm text-muted-foreground leading-relaxed">{nahual.descripcion}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>;
};
const CrossCard = ({
  position,
  variant,
  delay = 0,
  onClick
}: {
  position: CrossPositionDB;
  variant: CardVariant;
  delay?: number;
  onClick: () => void;
}) => {
  const isGreen = variant === 'green' || variant === 'greenCenter';
  const textColor = isGreen ? 'text-white' : 'text-gray-900';
  return <motion.div initial={{
    opacity: 0,
    scale: 0.8
  }} animate={{
    opacity: 1,
    scale: 1
  }} transition={{
    delay,
    type: "spring",
    stiffness: 200
  }} whileHover={{
    scale: 1.08
  }} whileTap={{
    scale: 0.95
  }} onClick={onClick} className="flex flex-col items-center cursor-pointer">
      <div className={`p-2 ${variantStyles[variant]} shadow-md hover:shadow-lg transition-shadow`}>
        <NahualImage animalGuia={position.kin.nahual.animal_guia} nahualName={position.kin.nahual.nombre} type="glifo" className={variant === 'greenCenter' ? 'w-20 h-20' : 'w-16 h-16'} />
      </div>
      <p className={`mt-1 text-[10px] font-bold ${isGreen ? 'text-foreground' : textColor} text-center`}>
        {position.kin.tone.numero} {position.kin.nahual.nombre.toUpperCase()}
      </p>
    </motion.div>;
};
export function MayanCrossDisplay({
  cross
}: MayanCrossDisplayProps) {
  const [selectedPosition, setSelectedPosition] = useState<CrossPositionDB | null>(null);
  return <div className="space-y-4">
      {/* Modal para info del Nahual */}
      <AnimatePresence>
        {selectedPosition && <NahualInfoModal position={selectedPosition} onClose={() => setSelectedPosition(null)} />}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} className="text-center">
        <h3 className="text-xl font-bold text-foreground">Tu Cruz Maya</h3>
        <p className="text-xs text-muted-foreground">Toca cada Nahual para ver su información</p>
      </motion.div>

      {/* Cruz Visual Layout */}
      <div className="relative grid grid-cols-3 gap-2 items-center justify-items-center max-w-sm mx-auto p-4">
        
        {/* Row 1: Concepción */}
        <CrossCard position={cross.concepcion.derecho} variant="red" delay={0.1} onClick={() => setSelectedPosition(cross.concepcion.derecho)} />
        <CrossCard position={cross.concepcion.centro} variant="green" delay={0.2} onClick={() => setSelectedPosition(cross.concepcion.centro)} />
        <CrossCard position={cross.concepcion.izquierdo} variant="yellow" delay={0.3} onClick={() => setSelectedPosition(cross.concepcion.izquierdo)} />

        {/* Row 2: Nacimiento */}
        <CrossCard position={cross.nacimiento.derecho} variant="green" delay={0.4} onClick={() => setSelectedPosition(cross.nacimiento.derecho)} />
        <CrossCard position={cross.nacimiento.centro} variant="greenCenter" delay={0.5} onClick={() => setSelectedPosition(cross.nacimiento.centro)} />
        <CrossCard position={cross.nacimiento.izquierdo} variant="green" delay={0.6} onClick={() => setSelectedPosition(cross.nacimiento.izquierdo)} />

        {/* Row 3: Destino */}
        <CrossCard position={cross.destino.derecho} variant="white" delay={0.7} onClick={() => setSelectedPosition(cross.destino.derecho)} />
        <CrossCard position={cross.destino.centro} variant="green" delay={0.8} onClick={() => setSelectedPosition(cross.destino.centro)} />
        <CrossCard position={cross.destino.izquierdo} variant="black" delay={0.9} onClick={() => setSelectedPosition(cross.destino.izquierdo)} />
      </div>

      {/* Nahual Name at bottom */}
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      delay: 1
    }} className="text-center">
        <h4 className="text-2xl font-bold text-foreground tracking-wider">
          {cross.nacimiento.centro.kin.nahual.nombre.toUpperCase()}
        </h4>
      </motion.div>

      {/* Legend - Puntos Cardinales */}
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      delay: 1.1
    }} className="p-4 rounded-xl bg-muted/30 border border-border/50 text-xs">
        <div className="grid grid-cols-2 gap-2 text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span>Este - Agua</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 rounded" />
            <span>Sur - Fuego</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-900 rounded" />
            <span>Oeste - Tierra</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border border-gray-300 rounded" />
            <span>Norte - Viento</span>
          </div>
          <div className="flex items-center gap-2 col-span-2 justify-center pt-2 border-t border-border/50 mt-1">
            <div className="w-4 h-4 bg-emerald-700 border-2 border-purple-500 rounded" />
            <span className="font-medium text-foreground">Tu Nahual de Nacimiento
          </span>
          </div>
        </div>
      </motion.div>
    </div>;
}