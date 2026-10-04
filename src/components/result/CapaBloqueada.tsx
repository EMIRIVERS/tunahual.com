import { ReactNode } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CapaBloqueadaProps {
  /** Si es true se muestra el contenido tal cual. */
  abierta: boolean;
  children: ReactNode;
  titulo: string;
  texto: string;
  boton: string;
  onAbrir?: () => void;
}

/**
 * Capa de la lectura que se abre con correo y WhatsApp. El nahual, el tono y
 * el glifo siguen libres; solo lo más profundo queda borroso con una
 * invitación (no un muro).
 */
export function CapaBloqueada({ abierta, children, titulo, texto, boton, onAbrir }: CapaBloqueadaProps) {
  if (abierta) return <>{children}</>;

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* `inert` saca el contenido borroso del foco y de los lectores de pantalla (React 18 no lo tipa). */}
      <div
        aria-hidden="true"
        className="blur-md select-none pointer-events-none opacity-70"
        {...({ inert: "" } as Record<string, string>)}
      >
        {children}
      </div>
      <div className="absolute inset-0 flex items-start justify-center px-4 pt-6 bg-background/40">
        <div className="max-w-xs text-center space-y-3 rounded-2xl bg-card/95 border border-border/60 p-5 shadow-lg">
          <Lock className="w-5 h-5 mx-auto text-primary/70" aria-hidden="true" />
          <p className="font-serif text-xl text-foreground">{titulo}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{texto}</p>
          {onAbrir && (
            <Button onClick={onAbrir} variant="cta" className="w-full rounded-full py-5">
              {boton}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
