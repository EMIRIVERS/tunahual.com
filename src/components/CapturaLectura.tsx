import { lazy, Suspense, useState } from "react";
import { Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLeadCapture } from "@/hooks/useLeadCapture";

const LeadCaptureModal = lazy(() =>
  import("@/components/LeadCaptureModal").then((m) => ({ default: m.LeadCaptureModal }))
);

interface CapturaLecturaProps {
  nahual: { nombre: string; significado?: string | null; descripcion?: string | null };
  tono?: number | null;
  /** Página de origen, para saber qué contenido capta más contactos. */
  origen: "kin" | "nahual" | "resultado";
  titulo?: string;
  texto?: string;
}

/**
 * Invitación a dejar correo y WhatsApp para las páginas que llegan por Google
 * (/kin, /nahual, /resultado). Allí no se conoce la fecha de nacimiento, así que
 * el formulario la pide. Usa el mismo camino que la home (useLeadCapture).
 */
export function CapturaLectura({
  nahual,
  tono,
  origen,
  titulo = "Abre tu Cruz Maya",
  texto = "Descubre tus nueve energías, tu cielo de nacimiento y tu lectura completa. Déjame tu correo y te la envío.",
}: CapturaLecturaProps) {
  const [abierto, setAbierto] = useState(false);
  const { submit, isSubmitting, leadSubmitted, emailSent } = useLeadCapture();

  if (leadSubmitted) {
    return (
      <div className="rounded-2xl p-4 bg-primary/5 border border-primary/15 flex items-center justify-center gap-2 text-sm text-foreground">
        <Check className="w-4 h-4 text-primary" />
        {emailSent ? "Te enviamos tu lectura a tu correo" : "Tu lectura quedó guardada"}
      </div>
    );
  }

  return (
    <section
      aria-label="Recibir mi lectura"
      className="rounded-2xl p-6 bg-card/70 border border-border/60 text-center space-y-3"
    >
      <p className="font-serif text-2xl text-foreground">{titulo}</p>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">{texto}</p>
      <Button onClick={() => setAbierto(true)} variant="cta" className="rounded-full py-6 px-8 text-base font-medium gap-2">
        <Mail className="w-5 h-5" />
        Recibir mi lectura
      </Button>

      <Suspense fallback={null}>
        {abierto && (
          <LeadCaptureModal
            isOpen={abierto}
            onClose={() => setAbierto(false)}
            isSubmitting={isSubmitting}
            pedirFecha
            onSubmit={async (nombre, email, telefono, fecha) => {
              if (!fecha) return;
              const ok = await submit({ nombre, email, telefono, fechaNacimiento: fecha, nahual, tono, origen });
              if (ok) setAbierto(false);
            }}
          />
        )}
      </Suspense>
    </section>
  );
}
