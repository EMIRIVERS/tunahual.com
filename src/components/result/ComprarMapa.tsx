import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import { crearCheckoutMapa, fechaISOLocal, type DatosMapa } from "@/lib/checkoutMapa";
import { ETIQUETAS_GENERO, GENEROS, esGenero, type Genero } from "@/lib/oraculo/genero";

interface ComprarMapaProps {
  nahual: string;
  nahualSlug: string;
  tono: number;
  birthDate: Date | null;
}

/**
 * Cierre de la lectura: nombre y género (definen cómo se redacta el PDF) y el
 * botón que crea la sesión de Stripe y redirige. «Prefiero no decirlo» es una
 * opción real: da un texto sin marca de género; el género nunca se supone.
 */
export function ComprarMapa({ nahual, nahualSlug, tono, birthDate }: ComprarMapaProps) {
  const [nombre, setNombre] = useState("");
  const [genero, setGenero] = useState<Genero | "">("");
  const [cargando, setCargando] = useState(false);
  const { toast } = useToast();
  const idNombre = useId();
  const idGenero = useId();

  const nombreValido = nombre.replace(/[^\p{L}]/gu, "").length >= 2;
  const listo = nombreValido && esGenero(genero) && !!birthDate;

  const comprar = async () => {
    if (!listo || cargando || !esGenero(genero) || !birthDate) return;
    const datos: DatosMapa = {
      kinSlug: `${tono}-${nahualSlug}`,
      nahualSlug,
      tono,
      nahual,
      fechaNacimiento: fechaISOLocal(birthDate),
      nombre: nombre.trim(),
      genero,
    };
    setCargando(true);
    trackEvent("mapa_checkout_inicio", { nahual, tono });
    try {
      window.location.assign(await crearCheckoutMapa(datos));
    } catch (err) {
      setCargando(false);
      toast({ title: "No pudimos iniciar el pago", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    }
  };

  return (
    <form
      className="w-full max-w-sm text-left space-y-5 mt-2"
      onSubmit={(e) => {
        e.preventDefault();
        void comprar();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor={idNombre} className="font-serif text-base text-foreground">
          ¿Cómo te llamas?
        </Label>
        <Input
          id={idNombre}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          maxLength={100}
          autoComplete="name"
          placeholder="Tu nombre, como va en tu lectura"
          className="h-11"
        />
      </div>

      <fieldset className="space-y-2">
        <legend id={idGenero} className="font-serif text-base text-foreground">
          Para redactar tu lectura
        </legend>
        <RadioGroup value={genero} onValueChange={(v) => setGenero(esGenero(v) ? v : "")} aria-labelledby={idGenero} className="gap-0">
          {GENEROS.map((g) => (
            <div key={g} className="flex items-center gap-3">
              <RadioGroupItem value={g} id={`${idGenero}-${g}`} />
              <Label htmlFor={`${idGenero}-${g}`} className="flex-1 min-h-11 flex items-center cursor-pointer text-sm text-foreground/90">
                {ETIQUETAS_GENERO[g]}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </fieldset>

      <Button type="submit" disabled={!listo || cargando} className="w-full rounded-full px-8 py-6 text-base font-medium gap-2">
        {cargando && <Loader2 className="w-4 h-4 animate-spin" />}
        Obtener mi Mapa · 11 USD
      </Button>
    </form>
  );
}
