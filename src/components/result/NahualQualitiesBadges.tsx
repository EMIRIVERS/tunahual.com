import { memo } from "react";
import { motion } from "framer-motion";
import { MayanKinDB } from "@/utils/mayanCalculations";
import eyeIcon from "@/assets/icons/eye.svg";
import seedIcon from "@/assets/icons/seed.svg";
import shieldIcon from "@/assets/icons/shield.svg";
import sunIcon from "@/assets/icons/sun.svg";
import butterflyIcon from "@/assets/icons/butterfly.svg";
import compassStarIcon from "@/assets/icons/compass-star.svg";

interface QualitiesProps {
  result: MayanKinDB;
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const cualidadIcons = [eyeIcon, seedIcon, shieldIcon, sunIcon, butterflyIcon, compassStarIcon];

export const CualidadesRow = memo(function CualidadesRow({ result }: QualitiesProps) {
  const cualidades = result.nahual.cualidades ?? [];
  if (cualidades.length === 0) return null;

  return (
    <motion.div variants={itemVariants} className="space-y-3">
      <h4 className="eyebrow text-foreground/70">Cualidades del Nahual {result.nahual.nombre}</h4>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {cualidades.map((cualidad, i) => {
          const icon = cualidadIcons[i % cualidadIcons.length];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.06 * i, type: "spring" }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/5 border border-primary/20 p-2.5">
                <img src={icon} alt="" aria-hidden="true" className="w-full h-full object-contain" />
              </div>
              <span className="text-[11px] leading-tight text-muted-foreground">{cualidad}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
});

export const SombrasList = memo(function SombrasList({ result }: QualitiesProps) {
  const sombras = result.nahual.sombras ?? [];
  if (sombras.length === 0) return null;

  return (
    <motion.div variants={itemVariants} className="p-5 rounded-2xl bg-card/60 border border-border/60 space-y-3">
      <h4 className="eyebrow text-foreground/70">Aspectos a trabajar</h4>
      <ul className="space-y-2.5">
        {sombras.map((sombra, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
            <span className="mt-2 w-1 h-1 rounded-full bg-primary/50 shrink-0" />
            {sombra}
          </li>
        ))}
      </ul>
    </motion.div>
  );
});
