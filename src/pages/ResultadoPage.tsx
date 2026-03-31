import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { getNahualGlifo } from '@/data/nahualGlifos';
import { nahualToSlug } from '@/data/nahualSlugs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Compass, 
  Star, 
  Heart, 
  Share2,
  Calendar,
  Copy,
  Check
} from 'lucide-react';
import logoAzulAnaite from '@/assets/logo-azul-anaite.png';
import { useToast } from '@/hooks/use-toast';

interface NahualData {
  id: string;
  nombre: string;
  significado: string;
  descripcion: string;
  elemento: string;
  animal_guia: string;
  punto_cardinal: string;
  color_maiz: string;
  cualidades: string[];
  sombras: string[];
}

interface TonoData {
  id: string;
  numero: number;
  nombre: string;
  significado: string;
  descripcion: string;
  cualidades: string[];
}

const cardinalColors: Record<string, string> = {
  "Este": "bg-red-500/20 text-red-700 border-red-500/30",
  "Norte": "bg-white/40 text-gray-800 border-gray-400/30",
  "Oeste": "bg-gray-800/20 text-gray-900 border-gray-700/30",
  "Sur": "bg-amber-400/20 text-amber-700 border-amber-500/30",
};

export default function ResultadoPage() {
  const { kinSlug } = useParams<{ kinSlug: string }>();
  const [nahual, setNahual] = useState<NahualData | null>(null);
  const [tono, setTono] = useState<TonoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      if (!kinSlug) {
        setError('Resultado no encontrado');
        setLoading(false);
        return;
      }

      // Parse slug: "7-imox" -> tono 7, nahual "imox"
      const match = kinSlug.match(/^(\d+)-([a-z]+)$/i);
      if (!match) {
        setError('Formato de resultado inválido');
        setLoading(false);
        return;
      }

      const tonoNumero = parseInt(match[1], 10);
      const nahualSlug = match[2].toLowerCase();

      // Find the nahual name from slug
      const nahualName = Object.entries(nahualToSlug).find(
        ([_, slug]) => slug === nahualSlug
      )?.[0];

      if (!nahualName || tonoNumero < 1 || tonoNumero > 13) {
        setError('Resultado no encontrado');
        setLoading(false);
        return;
      }

      try {
        const [nahualRes, tonoRes] = await Promise.all([
          supabase.from('nahuales').select('*').eq('nombre', nahualName).single(),
          supabase.from('tonos').select('*').eq('numero', tonoNumero).single()
        ]);

        if (nahualRes.error) throw nahualRes.error;
        if (tonoRes.error) throw tonoRes.error;

        setNahual(nahualRes.data);
        setTono(tonoRes.data);
      } catch (err: any) {
        console.error('Error fetching result:', err);
        setError('Error al cargar el resultado');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [kinSlug]);

  const handleShareWhatsApp = () => {
    const url = window.location.href;
    const text = `🌟 Mi Nahual Maya es *${tono?.numero} ${nahual?.nombre}*\n\n✨ Descubre el tuyo:`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopyLink = async () => {
    const url = window.location.href;
    const text = `Mi Nahual Maya es ${tono?.numero} ${nahual?.nombre}. Descubre el tuyo: ${url}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: '¡Enlace copiado!', description: 'Compártelo con tus amigos' });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando resultado...</p>
        </div>
      </div>
    );
  }

  if (error || !nahual || !tono) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Resultado no encontrado</h1>
          <p className="text-muted-foreground mb-6">
            Este Kin no existe o el enlace es incorrecto.
          </p>
          <Link to="/">
            <Button>
              <Calendar className="w-4 h-4 mr-2" />
              Calcular mi Nahual
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const glifo = getNahualGlifo(nahual.nombre);
  const cardinalClass = cardinalColors[nahual.punto_cardinal] || "";
  const kinNumber = ((tono.numero - 1) * 20 + (Object.keys(nahualToSlug).indexOf(nahual.nombre) + 1) - 1) % 260 + 1;

  // SEO structured data - Article
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `Nahual ${tono.numero} ${nahual.nombre} - Tu Energía Maya`,
    "description": `El Nahual ${tono.numero} ${nahual.nombre} combina la energía del tono ${tono.nombre} con el nahual ${nahual.nombre}. ${nahual.descripcion.slice(0, 150)}`,
    "author": {
      "@type": "Organization",
      "name": "Azul Anaité"
    }
  };

  // SEO structured data - Breadcrumbs
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": "https://tunahual.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": `Nahual ${tono.numero} ${nahual.nombre}`,
        "item": `https://tunahual.com/resultado/${kinSlug}`
      }
    ]
  };

  // Dynamic OG image URL - include cross params from URL if available
  const searchParams = new URLSearchParams(window.location.search);
  const crossQueryParams = ['concepcion', 'concepcion_izq', 'concepcion_der', 'izq', 'der', 'destino', 'destino_izq', 'destino_der']
    .map(key => {
      const val = searchParams.get(key);
      return val ? `${key}=${encodeURIComponent(val)}` : '';
    })
    .filter(Boolean)
    .join('&');
  
  const ogImageUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/og-image?nahual=${encodeURIComponent(nahual.nombre)}&tono=${tono.numero}${crossQueryParams ? `&${crossQueryParams}` : ''}`;

  return (
    <>
      <Helmet>
        <title>{tono.numero} {nahual.nombre} - Tu Nahual Maya | Calculadora Cholq'ij</title>
        <meta name="description" content={`Tu Nahual Maya es ${tono.numero} ${nahual.nombre}. El tono ${tono.nombre} te da ${tono.significado.toLowerCase()}. El nahual ${nahual.nombre} significa ${nahual.significado.toLowerCase()}. Descubre tu misión de vida.`} />
        <meta property="og:title" content={`Mi Nahual Maya: ${tono.numero} ${nahual.nombre}`} />
        <meta property="og:description" content={`Descubre qué significa tener el Nahual ${tono.numero} ${nahual.nombre} según el calendario sagrado Maya Cholq'ij.`} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImageUrl} />
        <link rel="canonical" href={`https://tunahual.com/resultado/${kinSlug}`} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={logoAzulAnaite} alt="Azul Anaité" className="h-8 w-auto" />
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShareWhatsApp} className="gap-1 bg-green-600 hover:bg-green-700 text-white border-green-600">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="hidden sm:inline">WhatsApp</span>
              </Button>
              <Link to="/">
                <Button size="sm">
                  Calcular otro
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <ol className="flex items-center gap-2">
              <li><Link to="/" className="hover:text-foreground">Inicio</Link></li>
              <li>/</li>
              <li className="text-foreground font-medium">Resultado: {tono.numero} {nahual.nombre}</li>
            </ol>
          </nav>
        </div>

        <main className="container mx-auto px-4 pb-16">
          {/* Hero */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <div className="flex justify-center mb-6">
              {glifo && (
                <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/30">
                  <img 
                    src={glifo} 
                    alt={`Glifo de ${nahual.nombre}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 justify-center mb-4">
              <Badge variant="secondary" className="text-lg px-4 py-1">
                Nahual #{kinNumber}
              </Badge>
              <Badge className={cardinalClass}>
                <Compass className="w-3 h-3 mr-1" />
                {nahual.punto_cardinal}
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="text-primary">{tono.numero}</span> {nahual.nombre}
            </h1>
            <p className="text-xl text-muted-foreground">
              Tono {tono.nombre} • Nahual {nahual.significado}
            </p>
          </motion.section>

          {/* Content Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Tono */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-primary">{tono.numero}</span>
                  <div>
                    <div className="text-lg">Tono {tono.nombre}</div>
                    <div className="text-sm text-muted-foreground font-normal">{tono.significado}</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{tono.descripcion}</p>
                {tono.cualidades && tono.cualidades.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tono.cualidades.map((c, i) => (
                      <Badge key={i} variant="outline">{c}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Nahual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div>
                    <div className="text-lg">Nahual {nahual.nombre}</div>
                    <div className="text-sm text-muted-foreground font-normal">{nahual.significado}</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{nahual.descripcion}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Elemento</p>
                    <p className="font-medium">{nahual.elemento}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Animal Guía</p>
                    <p className="font-medium">{nahual.animal_guia}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Color de Maíz</p>
                    <p className="font-medium">{nahual.color_maiz}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Punto Cardinal</p>
                    <p className="font-medium">{nahual.punto_cardinal}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cualidades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  Tus Cualidades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {nahual.cualidades?.map((cualidad, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span>{cualidad}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Sombras */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Aspectos a Trabajar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {nahual.sombras?.map((sombra, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-xs">•</span>
                      <span>{sombra}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <section className="text-center py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">¿Quieres conocer tu Cruz Maya completa?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Calcula tu resultado completo con la Cruz Maya de 9 posiciones.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/">
                <Button size="lg" className="gap-2">
                  <Calendar className="w-5 h-5" />
                  Calcular mi Cruz Maya
                </Button>
              </Link>
              <Link to={`/nahual/${nahualToSlug[nahual.nombre]}`}>
                <Button size="lg" variant="outline" className="gap-2">
                  Conocer más sobre {nahual.nombre}
                </Button>
              </Link>
            </div>
          </section>

          {/* Share Section */}
          <section className="text-center py-8">
            <p className="text-muted-foreground mb-4">Comparte tu resultado</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={handleShareWhatsApp} className="gap-2 bg-green-600 hover:bg-green-700">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Compartir en WhatsApp
              </Button>
              <Button variant="outline" size="lg" onClick={handleCopyLink} className="gap-2">
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Enlace copiado' : 'Copiar enlace'}
              </Button>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t py-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Azul Anaité. Todos los derechos reservados.</p>
        </footer>
      </div>
    </>
  );
}
