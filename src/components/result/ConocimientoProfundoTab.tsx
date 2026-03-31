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
    <div className="space-y-6">
      <motion.div
        variants={itemVariants}
        className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20"
      >
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-500" />
          Ceremonias y Rituales
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {conocimiento.ceremoniasYRituales}
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20"
      >
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-500" />
          Mensaje Espiritual
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed italic">
          "{conocimiento.mensajeEspiritual}"
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20"
      >
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Moon className="w-4 h-4 text-indigo-500" />
          Trabajo Espiritual
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {conocimiento.trabajoEspiritual}
        </p>
        {conocimiento.fecundadoEn && (
          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-indigo-500/20">
            <span className="font-medium">Los nacidos en {nahualNombre} fueron fecundados en:</span> {conocimiento.fecundadoEn}
          </p>
        )}
      </motion.div>

      {/* Polaridades */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/20">
          <h4 className="font-semibold text-foreground mb-3 text-sm">Polaridad Positiva</h4>
          <ul className="space-y-1">
            {conocimiento.polaridadPositiva.map((item, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20">
          <h4 className="font-semibold text-foreground mb-3 text-sm">Aspectos a Trabajar</h4>
          <ul className="space-y-1">
            {conocimiento.polaridadNegativa.map((item, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-red-500 mt-0.5">!</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Significado Profundo */}
      <motion.div
        variants={itemVariants}
        className="p-4 rounded-2xl bg-primary/5 border border-primary/10"
      >
        <h4 className="font-semibold text-foreground mb-3">Significado Profundo</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {conocimiento.significadoProfundo}
        </p>
      </motion.div>

      {/* Relación con la Naturaleza */}
      <motion.div
        variants={itemVariants}
        className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20"
      >
        <h4 className="font-semibold text-foreground mb-3 text-sm">Conexión con la Naturaleza</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {conocimiento.relacionConNaturaleza}
        </p>
      </motion.div>
    </div>
  );
});
