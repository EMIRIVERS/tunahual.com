import { memo } from "react";
import { motion } from "framer-motion";
import { MayanKinDB } from "@/utils/mayanCalculations";

interface TonoSpotlightCardProps {
  result: MayanKinDB;
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export const TonoSpotlightCard = memo(function TonoSpotlightCard({ result }: TonoSpotlightCardProps) {
  const { tone } = result;

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-2xl p-6 bg-gradient-to-br from-[#3a1f38] to-[#1c0f1c] border border-[#5c3158]/50"
    >
      <div className="flex items-baseline gap-4">
        <span className="font-serif text-5xl leading-none text-[#e8c88f]">{tone.numero}</span>
        <div>
          <p className="eyebrow text-[#d4a574]/70 mb-1">Tono</p>
          <p className="font-serif text-2xl text-[#f4efc5] leading-tight">{tone.nombre}</p>
          <p className="text-xs uppercase tracking-wide text-[#d4a574]/80 mt-0.5">{tone.significado}</p>
        </div>
      </div>

      {tone.descripcion && (
        <p className="text-sm leading-relaxed text-[#f4efc5]/80 mt-4">{tone.descripcion}</p>
      )}

      {tone.cualidades && tone.cualidades.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#f4efc5]/10">
          {tone.cualidades.map((c, i) => (
            <span
              key={i}
              className="text-[11px] uppercase tracking-wide text-[#e8c88f] px-2.5 py-1 rounded-full border border-[#e8c88f]/25"
            >
              {c}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
});
