import { memo } from "react";
import { motion } from "framer-motion";
import { Flame, BookOpen, Moon } from "lucide-react";
import { NahualConocimientoExpandido } from "@/data/mayanKnowledge";

interface ConocimientoProfundoTabProps {
  conocimiento: NahualConocimientoExpandido;
  nahualNombre: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export const ConocimientoProfundoTab = memo(function ConocimientoProfundoTab({ 
  conocimiento,
  nahualNombre
}: ConocimientoProfundoTabProps) {
  return (
    <div className="space-y-6 prose-measure">
      <motion.div
        variants={itemVariants}
        className="p-5 rounded-2xl bg-card/60 border border-border/60"
      >
        <h4 className="font-serif text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
          <Flame className="w-4 h-4 text-primary/70" />
          Ceremonias y Rituales
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {conocimiento.ceremoniasYRituales}
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="p-6 rounded-2xl bg-primary/5 border border-primary/15 text-center"
      >
        <BookOpen className="w-5 h-5 text-primary/70 mx-auto mb-3" />
        <p className="font-serif text-xl text-foreground leading-snug italic">
          "{conocimiento.mensajeEspiritual}"
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="p-5 rounded-2xl bg-card/60 border border-border/60"
      >
        <h4 className="font-serif text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
          <Moon className="w-4 h-4 text-primary/70" />
          Trabajo Espiritual
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {conocimiento.trabajoEspiritual}
        </p>
        {conocimiento.fecundadoEn && (
          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/60">
            <span className="font-medium text-foreground/80">Los nacidos en {nahualNombre} fueron fecundados en:</span> {conocimiento.fecundadoEn}
          </p>
        )}
      </motion.div>

      {/* Polaridades */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-card/60 border border-border/60">
          <h4 className="font-serif text-lg font-semibold text-foreground mb-3">Luz</h4>
          <ul className="space-y-1.5">
            {conocimiento.polaridadPositiva.map((item, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-5 rounded-2xl bg-card/60 border border-border/60">
          <h4 className="font-serif text-lg font-semibold text-foreground mb-3">Aspectos a trabajar</h4>
          <ul className="space-y-1.5">
            {conocimiento.polaridadNegativa.map((item, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-muted-foreground/50 mt-0.5">·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Significado Profundo */}
      <motion.div
        variants={itemVariants}
        className="p-5 rounded-2xl bg-card/60 border border-border/60"
      >
        <h4 className="font-serif text-xl font-semibold text-foreground mb-3">Significado Profundo</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {conocimiento.significadoProfundo}
        </p>
      </motion.div>

      {/* Relación con la Naturaleza */}
      <motion.div
        variants={itemVariants}
        className="p-5 rounded-2xl bg-card/60 border border-border/60"
      >
        <h4 className="font-serif text-xl font-semibold text-foreground mb-3">Conexión con la Naturaleza</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {conocimiento.relacionConNaturaleza}
        </p>
      </motion.div>
    </div>
  );
});
