import { useMemo } from "react";
import { NahualDB, TonoDB } from "@/hooks/useMayanData";
import { calculateMayanKinFromDB } from "@/utils/mayanCalculations";
import { getPotenciaGuia } from "@/data/energiaDelDia";
import { NahualImage } from "@/components/NahualImage";

interface EnergiaDelDiaProps {
  nahuales: NahualDB[];
  tonos: TonoDB[];
  /** Fecha a interpretar. Por defecto, hoy. */
  fecha?: Date;
}

/**
 * Widget "Energía de hoy": muestra el Nahual y el Tono (Potencia) del día,
 * con tres indicaciones de lo que conviene caminar, derivadas de las
 * 13 Potencias del material de Azul Anaité (src/data/energiaDelDia.ts).
 */
export function EnergiaDelDia({ nahuales, tonos, fecha }: EnergiaDelDiaProps) {
  const hoy = useMemo(() => fecha ?? new Date(), [fecha]);

  const kin = useMemo(() => {
    if (nahuales.length === 0 || tonos.length === 0) return null;
    return calculateMayanKinFromDB(hoy, nahuales, tonos);
  }, [hoy, nahuales, tonos]);

  const guia = kin ? getPotenciaGuia(kin.tone.numero) : null;

  const fechaLegible = useMemo(
    () =>
      hoy.toLocaleDateString("es-GT", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    [hoy]
  );

  // Sin datos aún: no renderizamos nada (evita saltos de layout).
  if (!kin || !guia) return null;

  return (
    <section
      aria-label="Energía de hoy"
      className="relative overflow-hidden bg-card/70 border border-border/60 rounded-2xl p-5 text-left space-y-4"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.7rem] uppercase tracking-[0.25em] text-primary/80 font-medium">
          Energía de hoy
        </p>
        <p className="text-[0.7rem] text-muted-foreground capitalize">
          {fechaLegible}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden flex items-center justify-center">
          <NahualImage
            animalGuia={kin.nahual.animal_guia}
            nahualName={kin.nahual.nombre}
            type="glifo"
            className="w-14 h-14 object-contain"
          />
        </div>
        <div className="min-w-0">
          <p className="font-serif text-2xl font-semibold text-foreground leading-tight">
            {kin.tone.numero} {kin.tone.nombre} · {kin.nahual.nombre}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {kin.nahual.significado} · {guia.esencia}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-primary/70 font-medium">
          Para caminar este día
        </p>
        <ul className="space-y-1.5">
          {guia.indicaciones.map((indicacion, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-foreground/85 leading-relaxed">
              <span aria-hidden className="text-primary/60 mt-px">•</span>
              <span>{indicacion}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
