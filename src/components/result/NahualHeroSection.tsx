import { memo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { NahualImage } from "../NahualImage";
import { MayanKinDB } from "@/utils/mayanCalculations";
import lagoAtitlanBg from "@/assets/lago-atitlan-bg.jpg";
import glyphRing from "@/assets/icons/glyph-ring.svg";

// Colocar el video en public/videos/nahual-hero.mp4. Si no existe (404) o el
// usuario prefiere movimiento reducido, cae de vuelta a la foto de Atitlán.
const HERO_VIDEO_SRC = "/videos/nahual-hero.mp4";

interface NahualHeroSectionProps {
  result: MayanKinDB;
  formattedDate: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export const NahualHeroSection = memo(function NahualHeroSection({
  result,
  formattedDate,
}: NahualHeroSectionProps) {
  const [videoFailed, setVideoFailed] = useState(false);
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const showVideo = !videoFailed && !reducedMotion;

  return (
    <>
      {/* Hero: video/foto de fondo con lo esencial de la lectura sobrepuesto */}
      <motion.div variants={itemVariants} className="relative overflow-hidden">
        {/* Link to Azul Anaité, flotando sobre la imagen */}
        <a
          href="https://azulanaite.com"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute left-6 top-5 z-20 inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm drop-shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Azul Anaité</span>
        </a>

        {showVideo ? (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src={HERO_VIDEO_SRC}
            poster={lagoAtitlanBg}
            autoPlay
            muted
            loop
            playsInline
            onError={() => setVideoFailed(true)}
          />
        ) : (
          <img src={lagoAtitlanBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-background" />

        <div className="relative z-10 flex flex-col items-center px-6 py-11 min-h-[320px] justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative w-40 h-40 flex items-center justify-center mb-5"
          >
            <motion.img
              src={glyphRing}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full opacity-90"
              animate={reducedMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
            />
            <NahualImage
              animalGuia={result.nahual.animal_guia}
              nahualName={result.nahual.nombre}
              type="glifo"
              className="w-24 h-24 rounded-full shadow-2xl relative z-10"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="eyebrow text-white/70"
          >
            {formattedDate}
          </motion.p>

          <motion.div
            className="flex items-baseline gap-3 mt-1"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          >
            <span className="font-serif text-5xl font-semibold text-[#e8c88f] drop-shadow-md">
              {result.tone.numero}
            </span>
            <span className="font-serif text-4xl font-semibold text-white drop-shadow-md">
              {result.nahual.nombre}
            </span>
          </motion.div>

          <motion.p
            className="text-sm uppercase tracking-wide text-[#e8c88f]/90 mt-3 drop-shadow-sm text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {result.nahual.significado}
          </motion.p>
        </div>
      </motion.div>
    </>
  );
});
