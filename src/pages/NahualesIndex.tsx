import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useMayanData } from '@/hooks/useMayanData';
import { getNahualGlifo } from '@/data/nahualGlifos';
import { nahualToSlug } from '@/data/nahualSlugs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';
import logoAzulAnaite from '@/assets/logo-azul-anaite.png';
import { memo } from 'react';

const cardinalColors: Record<string, string> = {
  "Este": "bg-red-500/20 text-red-700 border-red-500/30",
  "Norte": "bg-white/40 text-gray-800 border-gray-400/30",
  "Oeste": "bg-gray-800/20 text-gray-900 border-gray-700/30",
  "Sur": "bg-amber-400/20 text-amber-700 border-amber-500/30",
};

// Memoized card component for better performance
const NahualCard = memo(function NahualCard({ 
  nahual, 
  index 
}: { 
  nahual: { id: string; nombre: string; significado: string; punto_cardinal: string; index_num: number }; 
  index: number;
}) {
  const glifo = getNahualGlifo(nahual.nombre);
  const slug = nahualToSlug[nahual.nombre];
  const cardinalClass = cardinalColors[nahual.punto_cardinal] || "";

  return (
    <div 
      className="animate-fade-in"
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
    >
      <Link to={`/nahual/${slug}`}>
        <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {glifo && (
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                  <img 
                    src={glifo} 
                    alt={`Glifo de ${nahual.nombre}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    width={64}
                    height={64}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground">#{nahual.index_num}</span>
                  <Badge className={`text-xs ${cardinalClass}`}>
                    <Compass className="w-2.5 h-2.5 mr-1" />
                    {nahual.punto_cardinal}
                  </Badge>
                </div>
                <h2 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                  {nahual.nombre}
                </h2>
                <p className="text-sm text-muted-foreground truncate">
                  {nahual.significado}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
});

export default function NahualesIndex() {
  const { nahuales, loading } = useMayanData();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Los 20 Nahuales del Calendario Maya Cholq'ij",
    "description": "Guía completa de los 20 signos del calendario sagrado maya. Descubre el significado, cualidades y misión espiritual de cada Nahual.",
    "url": "https://tunahual.com/nahuales",
    "publisher": {
      "@type": "Organization",
      "name": "Azul Anaité",
      "url": "https://azulanaite.com"
    }
  };

  return (
    <>
      <Helmet>
        <title>Los 20 Nahuales del Calendario Maya Cholq'ij | Tu Nahual</title>
        <meta name="description" content="Conoce los 20 Nahuales del calendario sagrado Maya Cholq'ij. Cada signo tiene cualidades únicas, elementos y misiones espirituales. Descubre tu signo maya." />
        <meta property="og:title" content="Los 20 Nahuales del Calendario Maya Cholq'ij" />
        <meta property="og:description" content="Guía completa de los 20 signos del calendario sagrado maya Cholq'ij." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tunahual.com/nahuales" />
        <link rel="canonical" href="https://tunahual.com/nahuales" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        {/* Header - removed backdrop-blur for better INP */}
        <header className="sticky top-0 z-50 bg-background/98 border-b">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src={logoAzulAnaite} 
                alt="Azul Anaité" 
                className="h-8 w-auto"
                width={115}
                height={32}
                loading="eager"
              />
            </Link>
            <Link to="/">
              <Button variant="outline" size="sm">
                Calcular mi Nahual
              </Button>
            </Link>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <ol className="flex items-center gap-2">
              <li><Link to="/" className="hover:text-foreground">Inicio</Link></li>
              <li>/</li>
              <li className="text-foreground font-medium">Nahuales</li>
            </ol>
          </nav>
        </div>

        <main className="container mx-auto px-4 pb-16">
          {/* Hero - CSS animations instead of framer-motion */}
          <section className="text-center py-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
              Los 20 Nahuales
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '100ms' }}>
              El calendario sagrado Maya <strong>Cholq'ij</strong> contiene 20 energías o signos llamados <em>Nahuales</em>. 
              Cada uno representa una fuerza cósmica con cualidades únicas.
            </p>
          </section>

          {/* Grid - optimized with memoized cards */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Cargando nahuales...</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {nahuales.map((nahual, index) => (
                <NahualCard key={nahual.id} nahual={nahual} index={index} />
              ))}
            </div>
          )}

          {/* CTA */}
          <section className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">¿Cuál es tu Nahual?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Ingresa tu fecha de nacimiento y descubre tu energía personal según el calendario Maya.
            </p>
            <Link to="/">
              <Button size="lg">
                Calcular mi Nahual
              </Button>
            </Link>
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
