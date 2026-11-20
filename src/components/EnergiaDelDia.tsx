import { useMemo } from "react";
import { NahualDB, TonoDB } from "@/hooks/useMayanData";
import { calculateMayanKinFromDB } from "@/utils/mayanCalculations";
import { getPotenciaGuia } from "@/data/energiaDelDia";
import { getNahualGlifo } from "@/data/nahualGlifos";
import { calcularLuna } from "@/utils/luna";

interface EnergiaDelDiaProps {
  nahuales: NahualDB[];
  tonos: TonoDB[];
  /** Fecha a interpretar. Por defecto, hoy. */
  fecha?: Date;
}

/**
 * Widget "Energía de hoy": muestra el Nahual y el Tono (Potencia) del día y
 * la primera indicación de lo que conviene caminar, derivada de las
 * 13 Potencias del material de Azul Anaité (src/data/energiaDelDia.ts).
 * Es la pieza secundaria de la home: sin tarjeta, separada por un filete.
 */
export function EnergiaDelDia({ nahuales, tonos, fecha }: EnergiaDelDiaProps) {
  const hoy = useMemo(() => fecha ?? new Date(), [fecha]);

  const kin = useMemo(() => {
    if (nahuales.length === 0 || tonos.length === 0) return null;
    return calculateMayanKinFromDB(hoy, nahuales, tonos);
  }, [hoy, nahuales, tonos]);

  const guia = kin ? getPotenciaGuia(kin.tone.numero) : null;
  const luna = useMemo(() => calcularLuna(hoy), [hoy]);

  // "domingo, 4 de octubre" → "Domingo 4 de octubre": solo la primera letra
  // en mayúscula (la clase `capitalize` ponía "De Octubre").
  const fechaLegible = useMemo(() => {
    const texto = hoy
      .toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })
      .replace(",", "");
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }, [hoy]);

  // Sin datos aún: no renderizamos nada (evita saltos de layout).
  if (!kin || !guia) return null;

  const glifo = getNahualGlifo(kin.nahual.nombre);
  const indicacion = guia.indicaciones[0];

  return (
    <section aria-labelledby="energia-hoy-titulo" className="border-t border-primary/25 pt-6 text-left">
      <p className="text-sm text-foreground/75">
        <span id="energia-hoy-titulo" className="font-medium text-secondary-foreground">
          Energía de hoy
        </span>
        <span aria-hidden className="mx-2 text-primary/50">/</span>
        <span>{fechaLegible}</span>
      </p>

      <div className="mt-4 flex items-start gap-4">
        {glifo && (
          // Los glifos son JPG con fondo blanco: el multiply sobre el disco
          // crema deja solo el trazo, sin el cuadrado blanco.
          <div className="grid h-[4.5rem] w-[4.5rem] shrink-0 place-items-center rounded-full bg-card ring-1 ring-primary/30">
            <img
              src={glifo}
              alt={`Glifo maya de ${kin.nahual.nombre}`}
              className="h-12 w-12 object-contain mix-blend-multiply opacity-80"
              loading="lazy"
              decoding="async"
            />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-serif text-[1.75rem] font-semibold leading-[1.1] tracking-[-0.01em] text-foreground sm:text-[2rem]">
            {kin.tone.numero} {kin.tone.nombre}
            <span className="block">{kin.nahual.nombre}</span>
          </p>
          <p className="mt-1.5 text-sm leading-snug text-foreground/80">
            {kin.nahual.significado}. {guia.esencia}
          </p>
          <p className="mt-1 text-xs text-foreground/70">
            {luna.nombre} · {luna.iluminacion}%
          </p>
        </div>
      </div>

      {indicacion && (
        <p className="mt-5 font-serif text-lg italic leading-snug text-foreground/90">
          <span className="not-italic font-sans text-xs font-medium text-secondary-foreground block mb-1">
            Para caminar este día
          </span>
          {indicacion}
        </p>
      )}
    </section>
  );
}
