import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { NahualImage } from "../NahualImage";
import { NahualDB, TonoDB } from "@/hooks/useMayanData";
import { calcularCargador } from "@/utils/cargador";

interface CargadorCardProps {
  birthDate: Date;
  nahuales: NahualDB[];
  tonos: TonoDB[];
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

/**
 * Muestra el Cargador del Año (Mam / Portador del Año solar en que nació la
 * persona). Ver src/utils/cargador.ts.
 */
export const CargadorCard = memo(function CargadorCard({
  birthDate,
  nahuales,
  tonos,
}: CargadorCardProps) {
  const cargador = useMemo(
    () => calcularCargador(birthDate, nahuales, tonos),
    [birthDate, nahuales, tonos]
  );

  const rango = useMemo(() => {
    if (!cargador) return "";
    const fmt = (d: Date) =>
      d.toLocaleDateString("es-GT", { day: "numeric", month: "short", year: "numeric" });
    return `${fmt(cargador.inicio)} — ${fmt(cargador.fin)}`;
  }, [cargador]);

  if (!cargador) return null;

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -2 }}
      className="flex items-center gap-4 p-4 bg-secondary/10 rounded-2xl border border-secondary/20 cursor-default"
    >
      <div className="w-20 h-20 shrink-0 rounded-xl flex items-center justify-center overflow-hidden">
        <NahualImage
          animalGuia={cargador.nahual.animal_guia}
          nahualName={cargador.nahual.nombre}
          type="glifo"
          className="w-[4.5rem] h-[4.5rem] object-contain"
        />
      </div>
      <div className="min-w-0">
        <p className="eyebrow text-muted-foreground">Cargador del Año</p>
        <p className="text-lg font-semibold text-foreground mt-0.5">{cargador.tono} {cargador.nahual.nombre}</p>
        {cargador.esencia && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{cargador.esencia}</p>
        )}
        <p className="text-[0.7rem] text-muted-foreground/70 mt-1">Año maya {cargador.anio} · {rango}</p>
      </div>
    </motion.div>
  );
});
