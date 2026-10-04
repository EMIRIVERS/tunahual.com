import { CapturaLectura } from '@/components/CapturaLectura';
import { useParams, Link } from 'react-router-dom';
import { useNahualBySlug } from '@/hooks/useNahualBySlug';
import { getNahualGlifo } from '@/data/nahualGlifos';
import { nahualToSlug, nahualOrder } from '@/data/nahualSlugs';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Compass, 
  Flame, 
  Heart, 
  Sun, 
  TreePine,
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import logoAzulAnaite from '@/assets/logo-azul-anaite.png';

const cardinalColors: Record<string, string> = {
  "Este": "bg-red-500/20 text-red-700 border-red-500/30",
  "Norte": "bg-white/40 text-gray-800 border-gray-400/30",
  "Oeste": "bg-gray-800/20 text-gray-900 border-gray-700/30",
  "Sur": "bg-amber-400/20 text-amber-700 border-amber-500/30",
};

const elementIcons: Record<string, React.ReactNode> = {
  "Agua": <span className="text-2xl">💧</span>,
  "Aire": <span className="text-2xl">🌬️</span>,
  "Tierra": <span className="text-2xl">🌍</span>,
  "Fuego": <span className="text-2xl">🔥</span>,
};

export default function NahualPage() {
  const { slug } = useParams<{ slug: string }>();
  const { nahual, loading, error } = useNahualBySlug(slug);

  // Get adjacent nahuales for navigation
  const currentIndex = nahual ? nahualOrder.indexOf(nahual.nombre) : -1;
  const prevNahual = currentIndex > 0 ? nahualOrder[currentIndex - 1] : null;
  const nextNahual = currentIndex < nahualOrder.length - 1 ? nahualOrder[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error || !nahual) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Nahual no encontrado</h1>
          <Link to="/nahuales">
            <Button>Ver todos los Nahuales</Button>
          </Link>
        </div>
      </div>
    );
  }

  const glifo = getNahualGlifo(nahual.nombre);
  const cardinalClass = cardinalColors[nahual.punto_cardinal] || "";

  // SEO structured data - Article
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `${nahual.nombre} - Nahual Maya del Calendario Cholq'ij`,
    "description": nahual.descripcion,
    "image": glifo,
    "author": {
      "@type": "Organization",
      "name": "Azul Anaité"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Azul Anaité",
      "logo": {
        "@type": "ImageObject",
        "url": logoAzulAnaite
      }
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
        "item": "https://www.tunahual.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Nahuales",
        "item": "https://www.tunahual.com/nahuales"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": nahual.nombre,
        "item": `https://www.tunahual.com/nahual/${slug}`
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{`${nahual.nombre} - Nahual Maya | Descubre tu Signo del Calendario Cholq'ij`}</title>
        <meta name="description" content={`${nahual.nombre} significa ${nahual.significado}. ${nahual.descripcion.slice(0, 150)}... Descubre las cualidades, elemento y misión espiritual de este Nahual Maya.`} />
        <meta property="og:title" content={`${nahual.nombre} - Nahual del Calendario Maya Cholq'ij`} />
        <meta property="og:description" content={nahual.descripcion.slice(0, 200)} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={`https://www.tunahual.com/nahual/${slug}`} />
        <link rel="alternate" hreflang="es-MX" href={`https://www.tunahual.com/nahual/${slug}`} />
        <link rel="alternate" hreflang="es" href={`https://www.tunahual.com/nahual/${slug}`} />
        <link rel="alternate" hreflang="x-default" href={`https://www.tunahual.com/nahual/${slug}`} />
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
            <nav className="flex items-center gap-4">
              <Link to="/nahuales" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Todos los Nahuales
              </Link>
              <Link to="/">
                <Button variant="outline" size="sm">
                  Calcular mi Nahual
                </Button>
              </Link>
            </nav>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <ol className="flex items-center gap-2">
              <li><Link to="/" className="hover:text-foreground">Inicio</Link></li>
              <li>/</li>
              <li><Link to="/nahuales" className="hover:text-foreground">Nahuales</Link></li>
              <li>/</li>
              <li className="text-foreground font-medium">{nahual.nombre}</li>
            </ol>
          </nav>
        </div>

        <main className="container mx-auto px-4 pb-16">
          {/* Hero Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              {/* Glyph */}
              <div className="shrink-0">
                {glifo && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-40 h-40 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/20"
                  >
                    <img 
                      src={glifo} 
                      alt={`Glifo maya de ${nahual.nombre}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                )}
              </div>

              {/* Title and basic info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-3">
                  <Badge className={cardinalClass}>
                    <Compass className="w-3 h-3 mr-1" />
                    {nahual.punto_cardinal}
                  </Badge>
                  <Badge variant="outline">
                    {elementIcons[nahual.elemento]}
                    <span className="ml-1">{nahual.elemento}</span>
                  </Badge>
                  <Badge variant="secondary">
                    {nahual.color_maiz}
                  </Badge>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  {nahual.nombre}
                </h1>
                <p className="text-xl text-primary font-medium mb-4">
                  {nahual.significado}
                </p>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  {nahual.descripcion}
                </p>
              </div>
            </div>
          </motion.section>

          {/* Main Content Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Cualidades */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Cualidades
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

            {/* Sombras / Aspectos a trabajar */}
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

            {/* Conexiones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TreePine className="w-5 h-5 text-primary" />
                  Conexiones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Glifo</p>
                  <p className="font-medium">{nahual.animal_guia}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Elemento de Conexión</p>
                  <p className="font-medium">{nahual.elemento_conexion}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Lugar de Poder</p>
                  <p className="font-medium">{nahual.lugar_poder}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Parte del Cuerpo</p>
                  <p className="font-medium">{nahual.parte_cuerpo}</p>
                </div>
                {nahual.fecundado_en && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Fecundado en</p>
                      <Link 
                        to={`/nahual/${nahualToSlug[nahual.fecundado_en]}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {nahual.fecundado_en}
                      </Link>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Mensaje Espiritual */}
            {nahual.mensaje_espiritual && (
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sun className="w-5 h-5 text-primary" />
                    Mensaje Espiritual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="italic text-muted-foreground">
                    "{nahual.mensaje_espiritual}"
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Conocimiento Expandido */}
          {(nahual.significado_profundo || nahual.ceremonias_rituales || nahual.trabajo_espiritual) && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Flame className="w-6 h-6 text-primary" />
                Conocimiento Profundo
              </h2>

              <div className="space-y-6">
                {nahual.significado_profundo && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Significado Profundo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{nahual.significado_profundo}</p>
                    </CardContent>
                  </Card>
                )}

                {nahual.ceremonias_rituales && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Ceremonias y Rituales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{nahual.ceremonias_rituales}</p>
                    </CardContent>
                  </Card>
                )}

                {nahual.trabajo_espiritual && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Trabajo Espiritual</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{nahual.trabajo_espiritual}</p>
                    </CardContent>
                  </Card>
                )}

                {nahual.relacion_naturaleza && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Relación con la Naturaleza</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{nahual.relacion_naturaleza}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>
          )}

          {/* Polaridades */}
          {(nahual.polaridad_positiva || nahual.polaridad_negativa) && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Polaridades</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {nahual.polaridad_positiva && (
                  <Card className="border-green-500/30 bg-green-500/5">
                    <CardHeader>
                      <CardTitle className="text-lg text-green-700">Polaridad Positiva</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {nahual.polaridad_positiva.map((item, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {nahual.polaridad_negativa && (
                  <Card className="border-orange-500/30 bg-orange-500/5">
                    <CardHeader>
                      <CardTitle className="text-lg text-orange-700">Polaridad a Trabajar</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {nahual.polaridad_negativa.map((item, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="text-orange-600">○</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>
          )}

          {/* CTA Lead Capture */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card/60 border border-border/60 rounded-3xl p-8 text-center mb-12"
          >
            <h2 className="font-serif text-3xl font-semibold mb-3">Descubre tu propio Nahual</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
              Conoce tu signo maya por fecha de nacimiento y tu Cruz Maya completa
              de nueve posiciones.
            </p>
            <Link to="/">
              <Button variant="default" className="rounded-full" size="lg">
                Calcular mi Nahual →
              </Button>
            </Link>
          </motion.div>

          {/* Navigation */}
          <nav className="flex justify-between items-center mt-12 pt-8 border-t" aria-label="Navegación entre nahuales">
            {prevNahual ? (
              <Link 
                to={`/nahual/${nahualToSlug[prevNahual]}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>{prevNahual}</span>
              </Link>
            ) : <div />}
            
            {nextNahual && (
              <Link 
                to={`/nahual/${nahualToSlug[nextNahual]}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>{nextNahual}</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            )}
          </nav>

          <div className="mt-10">
            <CapturaLectura nahual={nahual} origen="nahual" />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t py-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Azul Anaité. Todos los derechos reservados.</p>
        </footer>
      </div>
    </>
  );
}
