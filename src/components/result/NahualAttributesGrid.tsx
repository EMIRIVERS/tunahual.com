import { memo } from "react";
import { motion } from "framer-motion";
import { MayanKinDB } from "@/utils/mayanCalculations";
import compassRoseIcon from "@/assets/icons/compass-rose.svg";
import cornIcon from "@/assets/icons/corn.svg";
import elementFuegoIcon from "@/assets/icons/element-fuego.svg";
import elementAguaIcon from "@/assets/icons/element-agua.svg";
import elementTierraIcon from "@/assets/icons/element-tierra.svg";
import elementAireIcon from "@/assets/icons/element-aire.svg";
import elementLuzOscuridadIcon from "@/assets/icons/element-luz-oscuridad.svg";
import bodyIcon from "@/assets/icons/body.svg";
import templeIcon from "@/assets/icons/temple.svg";
import portalIcon from "@/assets/icons/portal.svg";

interface NahualAttributesGridProps {
  result: MayanKinDB;
}

const cardinalColors: Record<string, string> = {
  "Norte": "bg-white text-black border border-border",
  "Sur": "bg-yellow-400 text-black",
  "Este": "bg-red-500 text-white",
  "Oeste": "bg-gray-800 text-white",
};

const maizColors: Record<string, string> = {
  "Blanco": "bg-white border-2 border-gray-200",
  "Negro": "bg-gray-900",
  "Amarillo": "bg-yellow-400",
  "Rojo": "bg-red-500",
  "Azul": "bg-blue-800",
};

// Tinte del ícono del maíz según su color real de grano (no el bronce por defecto).
const maizIconTint: Record<string, string> = {
  "Blanco": "#ded5b8",
  "Negro": "#2b241f",
  "Amarillo": "#d9a520",
  "Rojo": "#b23a2e",
  "Azul": "#3d4f7a",
};

// Un ícono distinto por elemento, al estilo de los emblemas elementales (fuego/agua/tierra/aire).
const elementIcons: Record<string, string> = {
  "Fuego": elementFuegoIcon,
  "Agua": elementAguaIcon,
  "Tierra": elementTierraIcon,
  "Aire": elementAireIcon,
  "Luz y Oscuridad": elementLuzOscuridadIcon,
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export const NahualAttributesGrid = memo(function NahualAttributesGrid({ 
  result 
}: NahualAttributesGridProps) {
  const attributes = [
    {
      label: "Punto Cardinal",
      icon: compassRoseIcon,
      value: result.nahual.punto_cardinal,
      dot: cardinalColors[result.nahual.punto_cardinal],
    },
    {
      label: "Color del Maíz",
      icon: cornIcon,
      value: result.nahual.color_maiz,
      dot: maizColors[result.nahual.color_maiz],
      iconTint: maizIconTint[result.nahual.color_maiz],
    },
    {
      label: "Elemento",
      icon: elementIcons[result.nahual.elemento] ?? elementIcons["Tierra"],
      value: result.nahual.elemento,
    },
    { label: "Rige", icon: bodyIcon, value: result.nahual.parte_cuerpo },
    { label: "Lugar del Poder", icon: templeIcon, value: result.nahual.lugar_poder },
    { label: "Elemento de Conexión", icon: portalIcon, value: result.nahual.elemento_conexion },
  ];

  return (
    <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {attributes.map(({ label, icon, value, dot, iconTint }) => (
        <motion.div
          key={label}
          className="p-4 rounded-xl bg-card border border-border/50 text-center flex flex-col items-center gap-2"
          whileHover={{ scale: 1.02, y: -2 }}
        >
          {iconTint ? (
            <span
              aria-hidden="true"
              className="w-16 h-16 sm:w-20 sm:h-20"
              style={{
                backgroundColor: iconTint,
                WebkitMaskImage: `url(${icon})`,
                maskImage: `url(${icon})`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
              }}
            />
          ) : (
            <img src={icon} alt="" aria-hidden="true" className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
          )}
          <span className="eyebrow text-muted-foreground">{label}</span>
          <div className="flex items-center justify-center gap-1.5">
            {dot && <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />}
            <span className="font-medium text-sm">{value}</span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
});
