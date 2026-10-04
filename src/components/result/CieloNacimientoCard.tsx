import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Moon } from "lucide-react";
import { calcularLuna } from "@/utils/luna";
import { calcularCuentaLarga, calcularHaab } from "@/utils/cuentaLarga";

interface Props {
  birthDate: Date;
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

/** El cielo del día en que naciste: luna, Cuenta Larga y Haab'. */
export const CieloNacimientoCard = memo(function CieloNacimientoCard({ birthDate }: Props) {
  const { luna, cuentaLarga, haab } = useMemo(
    () => ({
      luna: calcularLuna(birthDate),
      cuentaLarga: calcularCuentaLarga(birthDate),
      haab: calcularHaab(birthDate),
    }),
    [birthDate]
  );

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-2xl p-5 bg-card border border-border/50 space-y-4"
    >
      <p className="eyebrow text-muted-foreground">El cielo de tu nacimiento</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="flex flex-col items-center gap-1">
          <Moon className="w-6 h-6 text-primary/70" aria-hidden="true" />
          <span className="font-serif text-lg text-foreground leading-tight">{luna.nombre}</span>
          <span className="text-xs text-muted-foreground">{luna.iluminacion}% iluminada</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="eyebrow text-muted-foreground">Cuenta Larga</span>
          <span className="font-serif text-lg text-foreground tabular-nums">{cuentaLarga.texto}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="eyebrow text-muted-foreground">Haab'</span>
          <span className="font-serif text-lg text-foreground">{haab.texto}</span>
        </div>
      </div>
    </motion.div>
  );
});
