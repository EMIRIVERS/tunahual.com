import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MayanKinDB, MayanCrossDB } from "@/utils/mayanCalculations";
import { nahualToSlug } from "@/data/nahualSlugs";

interface ShareButtonsProps {
  result: MayanKinDB;
  cross: MayanCrossDB | null;
}

export const ShareButtons = memo(function ShareButtons({ result, cross }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const nahualSlug = nahualToSlug[result.nahual.nombre] || result.nahual.nombre.toLowerCase();
  
  // Build cross params for OG image with all 9 positions
  const crossParams = cross ? new URLSearchParams({
    concepcion: cross.concepcion.centro.kin.nahual.nombre,
    concepcion_izq: cross.concepcion.izquierdo.kin.nahual.nombre,
    concepcion_der: cross.concepcion.derecho.kin.nahual.nombre,
    izq: cross.nacimiento.izquierdo.kin.nahual.nombre,
    der: cross.nacimiento.derecho.kin.nahual.nombre,
    destino: cross.destino.centro.kin.nahual.nombre,
    destino_izq: cross.destino.izquierdo.kin.nahual.nombre,
    destino_der: cross.destino.derecho.kin.nahual.nombre,
  }).toString() : '';
  
  const shareUrl = `${window.location.origin}/resultado/${result.tone.numero}-${nahualSlug}${crossParams ? `?${crossParams}` : ''}`;
  
  const handleShareWhatsApp = () => {
    const text = `🌟 Mi Nahual Maya es *${result.tone.numero} ${result.nahual.nombre}*\n\n✨ Descubre el tuyo:`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${shareUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopyLink = async () => {
    const text = `Mi Nahual Maya es ${result.tone.numero} ${result.nahual.nombre}. Descubre el tuyo: ${shareUrl}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: '¡Enlace copiado!', description: 'Compártelo con tus amigos' });
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="flex flex-col gap-3">
      <Button 
        onClick={handleShareWhatsApp}
        className="w-full rounded-full py-6 text-base font-medium gap-2 bg-green-600 hover:bg-green-700"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Compartir en WhatsApp
      </Button>
      <Button 
        variant="outline"
        onClick={handleCopyLink}
        className="w-full rounded-full py-5 text-sm font-medium gap-2"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? 'Enlace copiado' : 'Copiar enlace'}
      </Button>
    </div>
  );
});
