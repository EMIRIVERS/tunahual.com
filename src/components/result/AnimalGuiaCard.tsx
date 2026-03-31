import { memo } from "react";
import { motion } from "framer-motion";
import { Cat } from "lucide-react";
import { NahualImage } from "../NahualImage";
import { getAnimalImage } from "@/data/animalImages";
import { MayanKinDB } from "@/utils/mayanCalculations";

interface AnimalGuiaCardProps {
  result: MayanKinDB;
}

interface TrecenaCardProps {
  trecenaNahual: {
    nombre: string;
    animal_guia: string;
    significado: string;
  };
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export const AnimalGuiaCard = memo(function AnimalGuiaCard({ result }: AnimalGuiaCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -2 }}
      className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10 cursor-default"
    >
      <motion.div 
        className="w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden"
        animate={{ rotate: [0, 2, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        {getAnimalImage(result.nahual.animal_guia) ? (
          <img 
            src={getAnimalImage(result.nahual.animal_guia)} 
            alt={result.nahual.animal_guia}
            className="w-[4.5rem] h-[4.5rem] object-contain"
          />
        ) : (
          <Cat className="w-10 h-10 text-primary" />
        )}
      </motion.div>
      <div>
        <p className="text-sm text-muted-foreground">Animal Guía</p>
        <p className="text-lg font-semibold text-foreground">{result.nahual.animal_guia}</p>
      </div>
    </motion.div>
  );
});

export const TrecenaCard = memo(function TrecenaCard({ trecenaNahual }: TrecenaCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -2 }}
      className="flex items-center gap-4 p-4 bg-secondary/10 rounded-2xl border border-secondary/20 cursor-default"
    >
      <motion.div 
        className="w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden"
        animate={{ rotate: [0, -2, 2, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <NahualImage
          animalGuia={trecenaNahual.animal_guia}
          nahualName={trecenaNahual.nombre}
          type="glifo"
          className="w-[4.5rem] h-[4.5rem] object-contain"
        />
      </motion.div>
      <div>
        <p className="text-sm text-muted-foreground">Tu Trecena</p>
        <p className="text-lg font-semibold text-foreground">1 {trecenaNahual.nombre}</p>
        <p className="text-xs text-muted-foreground">{trecenaNahual.significado}</p>
      </div>
    </motion.div>
  );
});
