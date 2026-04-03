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
  const [copiedInstagram, setCopiedInstagram] = useState(false);
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
    const text = `🌟 Descubrí que mi Nahual Maya es *${result.tone.numero} ${result.nahual.nombre}*\n\n${result.nahual.descripcion?.substring(0, 80)}...\n\n✨ Calcula el tuyo gratis:`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${shareUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank');
  };

  const handleShareInstagram = async () => {
    const text = `🌟 Descubrí que mi Nahual Maya es ${result.tone.numero} ${result.nahual.nombre}\n\n${result.nahual.descripcion?.substring(0, 80)}...\n\n✨ Calcula el tuyo gratis: ${shareUrl}`;
    await navigator.clipboard.writeText(text);
    setCopiedInstagram(true);
    toast({ title: '¡Texto copiado!', description: 'Ábrelo en Instagram Stories' });
    setTimeout(() => setCopiedInstagram(false), 2000);
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
      <p className="text-sm text-muted-foreground text-center">Comparte tu Nahual</p>

      {/* WhatsApp — ancho completo */}
      <Button
        onClick={handleShareWhatsApp}
        className="w-full rounded-full py-6 text-base font-medium gap-2 bg-green-600 hover:bg-green-700"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Compartir en WhatsApp
      </Button>

      {/* Facebook + Instagram — fila de dos */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={handleShareFacebook}
          className="rounded-full py-5 text-sm font-medium gap-2 bg-[#1877F2] hover:bg-[#1565d8] text-white"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
          </svg>
          Facebook
        </Button>

        <Button
          onClick={handleShareInstagram}
          className="rounded-full py-5 text-sm font-medium gap-2 text-white border-0"
          style={{
            background: copiedInstagram
              ? '#9333ea'
              : 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
          }}
        >
          {copiedInstagram ? (
            <Check className="w-4 h-4" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          )}
          {copiedInstagram ? 'Copiado' : 'Instagram'}
        </Button>
      </div>

      {/* Copiar enlace — ancho completo */}
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
