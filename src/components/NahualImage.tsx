import { useNahualImage } from "@/hooks/useNahualImage";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageOff } from "lucide-react";
import { getNahualGlifo } from "@/data/nahualGlifos";

interface NahualImageProps {
  animalGuia: string;
  nahualName: string;
  type?: "animal" | "place" | "glifo";
  className?: string;
}

export function NahualImage({
  animalGuia,
  nahualName,
  type = "glifo",
  className = "",
}: NahualImageProps) {
  // First check if we have a static glyph for this nahual
  const staticGlifo = getNahualGlifo(nahualName);
  
  // Only use AI generation if no static glyph exists and type is not glifo
  const shouldUseAI = !staticGlifo && type !== "glifo";
  const { imageUrl, isLoading, error } = useNahualImage(
    animalGuia, 
    nahualName, 
    type === "glifo" ? "animal" : type,
    !shouldUseAI // skip AI generation if we have a static glyph or type is glifo
  );

  // If we have a static glyph, use it
  if (staticGlifo) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <div className="w-full h-full flex items-center justify-center p-2">
          <img
            src={staticGlifo}
            alt={`Glifo Maya de ${nahualName}`}
            className="w-full h-full object-contain max-h-48"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    );
  }

  // Fallback to AI-generated image or show placeholder
  if (isLoading && shouldUseAI) {
    return (
      <div className={`relative overflow-hidden rounded-2xl ${className}`}>
        <Skeleton className="w-full h-full min-h-[200px]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse text-muted-foreground text-sm">
              Generando imagen con IA...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if ((error || !imageUrl) && shouldUseAI) {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-muted flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <ImageOff className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground">
            {error || "Glifo no disponible aún"}
          </p>
        </div>
      </div>
    );
  }

  if (imageUrl && shouldUseAI) {
    return (
      <div className={`relative overflow-hidden rounded-2xl ${className}`}>
        <img
          src={imageUrl}
          alt={`${animalGuia} - ${nahualName}`}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
    );
  }

  // Default placeholder for nahuales without static glifo
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-muted flex items-center justify-center ${className}`}>
      <div className="text-center p-4">
        <ImageOff className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-xs text-muted-foreground">
          Glifo pendiente
        </p>
      </div>
    </div>
  );
}
