import { memo } from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { ResumenConocimiento } from "@/data/mayanKnowledge";

interface ConocimientoProfundoTabProps {
  resumen: ResumenConocimiento;
  nahualNombre: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

/**
 * Resumen del conocimiento profundo (se abre con correo y WhatsApp). La
 * interpretación extensa no se muestra en la web: es parte del Mapa.
 */
export const ConocimientoProfundoTab = memo(function ConocimientoProfundoTab({
  resumen,
  nahualNombre,
}: ConocimientoProfundoTabProps) {
  return (
    <div className="space-y-6 prose-measure">
      <motion.div
        variants={itemVariants}
        className="p-5 rounded-2xl bg-card/60 border border-border/60"
      >
        <h4 className="font-serif text-xl font-semibold text-foreground mb-3">
          {nahualNombre} en breve
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{resumen.significado}</p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-3">{resumen.naturaleza}</p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="p-6 rounded-2xl bg-primary/5 border border-primary/15 text-center"
      >
        <BookOpen className="w-5 h-5 text-primary/70 mx-auto mb-3" />
        <p className="font-serif text-xl text-foreground leading-snug italic">
          "{resumen.mensaje}"
        </p>
      </motion.div>

      {resumen.luz.length > 0 && (
        <motion.div variants={itemVariants} className="p-5 rounded-2xl bg-card/60 border border-border/60">
          <h4 className="font-serif text-lg font-semibold text-foreground mb-3">Luz</h4>
          <ul className="space-y-1.5">
            {resumen.luz.map((item, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">·</span>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
});
