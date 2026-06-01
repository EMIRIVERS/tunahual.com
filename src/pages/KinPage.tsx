import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { getNahualGlifo } from '@/data/nahualGlifos';
import { nahualToSlug, nahualOrder, slugToNahual } from '@/data/nahualSlugs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Compass, Star, Heart, Calendar, ArrowLeft, ArrowRight, Share2 
} from 'lucide-react';
import logoAzulAnaite from '@/assets/logo-azul-anaite.png';

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

// Kin interpretations based on tono
const tonoInterpretations: Record<number, { theme: string; focus: string }> = {
  1: { theme: "Propósito y Unidad", focus: "Este es el inicio de un nuevo ciclo. La energía se enfoca en establecer intenciones claras y comenzar con determinación." },
  2: { theme: "Dualidad y Decisión", focus: "Momento de elecciones y polaridades. La energía invita a encontrar equilibrio entre opciones." },
  3: { theme: "Acción y Movimiento", focus: "Energía dinámica que impulsa a actuar. Es tiempo de poner en marcha los planes." },
  4: { theme: "Estabilidad y Forma", focus: "Las estructuras toman forma. Es momento de consolidar y dar bases sólidas." },
  5: { theme: "Centro y Poder", focus: "El punto de máxima potencia. La energía está en su punto más alto de manifestación." },
  6: { theme: "Flujo y Ritmo", focus: "Equilibrio orgánico entre dar y recibir. La energía fluye naturalmente." },
  7: { theme: "Reflexión y Propósito", focus: "Momento de introspección y alineación con el propósito mayor." },
  8: { theme: "Armonía e Integridad", focus: "Integración de todas las partes. La energía busca completitud." },
  9: { theme: "Paciencia y Perseverancia", focus: "Los procesos toman tiempo. Es momento de cultivar la paciencia." },
  10: { theme: "Manifestación y Creación", focus: "Las ideas se materializan. Energía de producción y resultados tangibles." },
  11: { theme: "Resolución y Liberación", focus: "Momento de soltar lo que ya no sirve y resolver pendientes." },
  12: { theme: "Comprensión y Cooperación", focus: "Entendimiento profundo y trabajo conjunto. La sabiduría se comparte." },
  13: { theme: "Trascendencia y Culminación", focus: "El ciclo culmina. Energía de elevación espiritual y preparación para lo nuevo." },
};

export default function KinPage() {
  const { kinSlug } = useParams<{ kinSlug: string }>();
  const [nahual, setNahual] = useState<NahualData | null>(null);
  const [tono, setTono] = useState<TonoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse slug and calculate navigation
  const parsed = useMemo(() => {
    if (!kinSlug) return null;
    const match = kinSlug.match(/^(\d+)-([a-z]+)$/i);
    if (!match) return null;

    const tonoNum = parseInt(match[1], 10);
    const nahualSlug = match[2].toLowerCase();
    const nahualName = slugToNahual[nahualSlug];

    if (!nahualName || tonoNum < 1 || tonoNum > 13) return null;

    const nahualIndex = nahualOrder.indexOf(nahualName);
    const kinNumber = ((tonoNum - 1) * 20 + nahualIndex) % 260 + 1;

    // Calculate prev/next Kin
    const prevKinNum = kinNumber === 1 ? 260 : kinNumber - 1;
    const nextKinNum = kinNumber === 260 ? 1 : kinNumber + 1;

    const getKinSlug = (num: number) => {
      // Reverse calculation: kinNumber = ((tono-1)*20 + nahualIndex) % 260 + 1
      // We need to find tono and nahualIndex for a given kinNumber
      const idx = num - 1;
      const nIdx = idx % 20;
      const tIdx = idx % 13;
      return `${tIdx + 1}-${nahualToSlug[nahualOrder[nIdx]]}`;
    };

    return {
      tonoNum,
      nahualName,
      nahualIndex,
      kinNumber,
      prevSlug: getKinSlug(prevKinNum),
      nextSlug: getKinSlug(nextKinNum),
      prevKin: prevKinNum,
      nextKin: nextKinNum,
    };
  }, [kinSlug]);

  useEffect(() => {
    async function fetchData() {
      if (!parsed) {
        setError('Kin no encontrado');
        setLoading(false);
        return;
      }

      try {
        const [nahualRes, tonoRes] = await Promise.all([
          supabase.from('nahuales').select('*').eq('nombre', parsed.nahualName).maybeSingle(),
          supabase.from('tonos').select('*').eq('numero', parsed.tonoNum).maybeSingle()
        ]);

        if (!nahualRes.data || !tonoRes.data) {
          setError('Kin no encontrado');
        } else {
          setNahual(nahualRes.data);
          setTono(tonoRes.data);
        }
      } catch (err) {
        console.error('Error fetching kin:', err);
        setError('Error al cargar');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [parsed]);

  const handleShare = () => {
    const url = `https://tunahual.com/kin/${kinSlug}`;
    const text = `🌟 Kin ${parsed?.kinNumber}: ${tono?.numero} ${nahual?.nombre}\n✨ Descubre tu Kin Maya:`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !nahual || !tono || !parsed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Kin no encontrado</h1>
          <p className="text-muted-foreground mb-6">Este Kin no existe.</p>
          <Link to="/kin"><Button>Ver todos los Kin</Button></Link>
        </div>
      </div>
    );
  }

  const glifo = getNahualGlifo(nahual.nombre);
  const cardinalClass = cardinalColors[nahual.punto_cardinal] || "";
  const interpretation = tonoInterpretations[tono.numero];

  const pageTitle = `Kin ${parsed.kinNumber}: ${tono.numero} ${nahual.nombre} - Calendario Maya`;
  const pageDesc = `El Kin ${parsed.kinNumber} combina el Nahual ${nahual.nombre} (${nahual.significado}) con el Tono ${tono.numero} ${tono.nombre} (${tono.significado}). ${interpretation.theme}. Descubre el significado profundo de esta energía Maya.`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": pageTitle,
    "description": pageDesc,
    "author": { "@type": "Organization", "name": "Azul Anaité" },
    "publisher": { "@type": "Organization", "name": "Tu Nahual" },
    "mainEntityOfPage": `https://tunahual.com/kin/${kinSlug}`
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://tunahual.com/" },
      { "@type": "ListItem", "position": 2, "name": "Los 260 Kin", "item": "https://tunahual.com/kin" },
      { "@type": "ListItem", "position": 3, "name": `Kin ${parsed.kinNumber}`, "item": `https://tunahual.com/kin/${kinSlug}` }
    ]
  };

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `¿Qué significa el Kin ${parsed.kinNumber} (${tono.numero} ${nahual.nombre})?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `El Kin ${parsed.kinNumber} combina la energía del Nahual ${nahual.nombre}, que representa ${nahual.significado.toLowerCase()}, con el Tono ${tono.numero} ${tono.nombre}, que aporta ${tono.significado.toLowerCase()}. Juntos crean una energía de ${interpretation.theme.toLowerCase()}.`
        }
      },
      {
        "@type": "Question",
        "name": `¿Cuáles son las cualidades del Nahual ${nahual.nombre}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Las principales cualidades del Nahual ${nahual.nombre} son: ${nahual.cualidades?.slice(0, 4).join(', ') || nahual.descripcion.slice(0, 200)}.`
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta name="keywords" content={`kin ${parsed.kinNumber}, ${tono.numero} ${nahual.nombre}, nahual ${nahual.nombre}, tono ${tono.numero}, calendario maya, cholqij`} />
        <link rel="canonical" href={`https://tunahual.com/kin/${kinSlug}`} />
        <link rel="alternate" hreflang="es-MX" href={`https://tunahual.com/kin/${kinSlug}`} />
        <link rel="alternate" hreflang="es" href={`https://tunahual.com/kin/${kinSlug}`} />
        <link rel="alternate" hreflang="x-default" href={`https://tunahual.com/kin/${kinSlug}`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={`https://tunahual.com/kin/${kinSlug}`} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={`https://tunahual.com/api/og?nahual=${encodeURIComponent(nahual?.nombre || "")}&tono=${encodeURIComponent(tono?.numero ?? "")}`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`https://tunahual.com/api/og?nahual=${encodeURIComponent(nahual?.nombre || "")}&tono=${encodeURIComponent(tono?.numero ?? "")}`} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbData)}</script>
        <script type="application/ld+json">{JSON.stringify(faqData)}</script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 border-b">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={logoAzulAnaite} alt="Azul Anaité" className="h-8 w-auto" loading="eager" />
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare} className="gap-1 bg-green-600 hover:bg-green-700 text-white border-green-600">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Compartir</span>
              </Button>
              <Link to="/">
                <Button size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Mi Nahual
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Breadcrumb + Nav */}
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-2">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <ol className="flex items-center gap-2">
              <li><Link to="/" className="hover:text-foreground">Inicio</Link></li>
              <li>/</li>
              <li><Link to="/kin" className="hover:text-foreground">260 Kin</Link></li>
              <li>/</li>
              <li className="text-foreground font-medium">Kin {parsed.kinNumber}</li>
            </ol>
          </nav>
          <div className="flex items-center gap-2">
            <Link to={`/kin/${parsed.prevSlug}`}>
              <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Kin {parsed.prevKin}</Button>
            </Link>
            <Link to={`/kin/${parsed.nextSlug}`}>
              <Button variant="ghost" size="sm">Kin {parsed.nextKin} <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </Link>
          </div>
        </div>

        <main className="container mx-auto px-4 pb-16">
          {/* Hero */}
          <section className="text-center py-8 animate-fade-in">
            {glifo && (
              <div className="w-28 h-28 mx-auto mb-6 rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/30">
                <img src={glifo} alt={`Glifo ${nahual.nombre}`} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex flex-wrap gap-2 justify-center mb-4">
              <Badge variant="secondary" className="text-lg px-4 py-1">Kin {parsed.kinNumber}</Badge>
              <Badge className={cardinalClass}>
                <Compass className="w-3 h-3 mr-1" /> {nahual.punto_cardinal}
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="text-primary">{tono.numero}</span> {nahual.nombre}
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Tono {tono.nombre} • Nahual {nahual.significado}
            </p>
            <p className="text-lg font-medium text-primary">{interpretation.theme}</p>
          </section>

          {/* Interpretation */}
          <Card className="mb-8 border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <p className="text-lg leading-relaxed">{interpretation.focus}</p>
              <p className="mt-4 text-muted-foreground">
                La energía de <strong>{nahual.nombre}</strong> ({nahual.significado}) se expresa a través del 
                Tono <strong>{tono.numero} {tono.nombre}</strong> ({tono.significado}), creando un día ideal 
                para conectar con {nahual.elemento.toLowerCase()} y {nahual.animal_guia.toLowerCase()}.
              </p>
            </CardContent>
          </Card>

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
                {tono.cualidades?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tono.cualidades.map((c, i) => <Badge key={i} variant="outline">{c}</Badge>)}
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
                  <div><p className="text-muted-foreground">Elemento</p><p className="font-medium">{nahual.elemento}</p></div>
                  <div><p className="text-muted-foreground">Animal Guía</p><p className="font-medium">{nahual.animal_guia}</p></div>
                  <div><p className="text-muted-foreground">Color de Maíz</p><p className="font-medium">{nahual.color_maiz}</p></div>
                  <div><p className="text-muted-foreground">Punto Cardinal</p><p className="font-medium">{nahual.punto_cardinal}</p></div>
                </div>
              </CardContent>
            </Card>

            {/* Cualidades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" /> Cualidades de {nahual.nombre}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {nahual.cualidades?.map((c, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" /><span>{c}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Sombras */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" /> Aspectos a Trabajar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {nahual.sombras?.map((s, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-xs">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Related Links */}
          <section className="text-center py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">Explora más</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to={`/nahual/${nahualToSlug[nahual.nombre]}`}>
                <Button variant="outline">Conocer más sobre {nahual.nombre}</Button>
              </Link>
              <Link to="/kin">
                <Button variant="outline">Ver los 260 Kin</Button>
              </Link>
              <Link to="/">
                <Button><Calendar className="w-4 h-4 mr-2" /> Calcular mi Nahual</Button>
              </Link>
            </div>
          </section>

          {/* SEO Content */}
          <section className="mt-16 prose prose-sm max-w-3xl mx-auto">
            <h2>Significado del Kin {parsed.kinNumber}: {tono.numero} {nahual.nombre}</h2>
            <p>
              El <strong>Kin {parsed.kinNumber}</strong> del calendario Maya Cholq'ij representa la combinación única 
              del Nahual <strong>{nahual.nombre}</strong> ({nahual.significado}) con el Tono <strong>{tono.numero} 
              {tono.nombre}</strong> ({tono.significado}). Esta energía cósmica combina las cualidades del {nahual.elemento} 
              con la vibración numérica del {tono.numero}.
            </p>
            
            <h3>El Nahual {nahual.nombre}</h3>
            <p>
              {nahual.descripcion} Su animal guía es el {nahual.animal_guia} y está asociado con el punto 
              cardinal {nahual.punto_cardinal} y el color de maíz {nahual.color_maiz}.
            </p>

            <h3>El Tono {tono.numero} - {tono.nombre}</h3>
            <p>{tono.descripcion}</p>

            <h3>¿Es el Kin {parsed.kinNumber} tu Kin de nacimiento?</h3>
            <p>
              Si naciste en un día con el Kin {parsed.kinNumber}, las energías de {nahual.nombre} y el Tono {tono.numero} 
              influyen en tu misión de vida y personalidad. 
              <Link to="/" className="text-primary hover:underline ml-1">
                Calcula tu Kin de nacimiento exacto →
              </Link>
            </p>
          </section>
        </main>

        <footer className="border-t py-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Azul Anaité. Calendario Maya Cholq'ij.</p>
        </footer>
      </div>
    </>
  );
}
