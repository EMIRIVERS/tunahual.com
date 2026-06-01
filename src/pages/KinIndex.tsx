import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getNahualGlifo } from '@/data/nahualGlifos';
import { nahualToSlug, nahualOrder } from '@/data/nahualSlugs';
import logoAzulAnaite from '@/assets/logo-azul-anaite.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

// Generate all 260 Kin combinations
const allKins = nahualOrder.flatMap((nahual, nahualIndex) => 
  Array.from({ length: 13 }, (_, tonoIndex) => ({
    nahual,
    tono: tonoIndex + 1,
    slug: `${tonoIndex + 1}-${nahualToSlug[nahual]}`,
    kinNumber: (tonoIndex * 20 + nahualIndex) % 260 + 1,
  }))
).sort((a, b) => a.kinNumber - b.kinNumber);

// Group by Nahual for accordion view
const kinsByNahual = nahualOrder.map(nahual => ({
  nahual,
  kins: allKins.filter(k => k.nahual === nahual).sort((a, b) => a.tono - b.tono),
}));

export default function KinIndex() {
  const [search, setSearch] = useState('');
  const [expandedNahual, setExpandedNahual] = useState<string | null>(null);

  const filteredKins = useMemo(() => {
    if (!search.trim()) return allKins;
    const q = search.toLowerCase();
    return allKins.filter(k => 
      k.nahual.toLowerCase().includes(q) || 
      k.tono.toString().includes(q) ||
      k.slug.includes(q)
    );
  }, [search]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Los 260 Kin del Calendario Maya Cholq'ij",
    "description": "Explora los 260 Kin del calendario sagrado Maya. Cada Kin es una combinación única de uno de los 20 Nahuales con uno de los 13 Tonos.",
    "url": "https://tunahual.com/kin",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": 260,
      "itemListElement": allKins.slice(0, 20).map((kin, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "url": `https://tunahual.com/kin/${kin.slug}`,
        "name": `Kin ${kin.kinNumber}: ${kin.tono} ${kin.nahual}`
      }))
    }
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://tunahual.com/" },
      { "@type": "ListItem", "position": 2, "name": "Los 260 Kin", "item": "https://tunahual.com/kin" }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Los 260 Kin del Calendario Maya Cholq'ij | Tu Nahual</title>
        <meta name="description" content="Explora los 260 Kin del calendario sagrado Maya Cholq'ij. Cada Kin combina uno de los 20 Nahuales con uno de los 13 Tonos. Encuentra tu energía cósmica." />
        <meta name="keywords" content="260 kin, calendario maya, cholqij, nahuales, tonos, kin maya, calendario sagrado, tzolkin" />
        <link rel="canonical" href="https://tunahual.com/kin" />
        <meta property="og:title" content="Los 260 Kin del Calendario Maya" />
        <meta property="og:description" content="Descubre los 260 Kin del calendario sagrado Maya Cholq'ij. Cada Kin es una energía única." />
        <meta property="og:url" content="https://tunahual.com/kin" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbData)}</script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 border-b">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={logoAzulAnaite} alt="Azul Anaité" className="h-8 w-auto" loading="eager" />
            </Link>
            <Link to="/">
              <Button size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Calcular mi Nahual
              </Button>
            </Link>
          </div>
        </header>

        {/* Breadcrumb */}
        <nav className="container mx-auto px-4 py-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li><Link to="/" className="hover:text-foreground">Inicio</Link></li>
            <li>/</li>
            <li className="text-foreground font-medium">Los 260 Kin</li>
          </ol>
        </nav>

        <main className="container mx-auto px-4 pb-16">
          {/* Hero */}
          <section className="text-center py-8 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Los 260 Kin del Calendario Maya
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              El Cholq'ij es el calendario sagrado Maya de 260 días. Cada día es un <strong>Kin</strong>: 
              una combinación única de uno de los <strong>20 Nahuales</strong> (energías) con uno de los 
              <strong>13 Tonos</strong> (números sagrados). Explora todas las combinaciones.
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto relative mb-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por Nahual o Tono..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </section>

          {search.trim() ? (
            /* Search Results Grid */
            <section>
              <p className="text-sm text-muted-foreground mb-4">
                {filteredKins.length} resultados para "{search}"
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredKins.map(kin => {
                  const glifo = getNahualGlifo(kin.nahual);
                  return (
                    <Link
                      key={kin.slug}
                      to={`/kin/${kin.slug}`}
                      className="group bg-card border rounded-lg p-3 hover:border-primary hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {glifo && (
                          <img 
                            src={glifo} 
                            alt={kin.nahual} 
                            className="w-8 h-8 rounded object-cover"
                            loading="lazy"
                          />
                        )}
                        <Badge variant="secondary" className="text-xs">
                          Kin {kin.kinNumber}
                        </Badge>
                      </div>
                      <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {kin.tono} {kin.nahual}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>
          ) : (
            /* Accordion by Nahual */
            <section className="space-y-2">
              {kinsByNahual.map(({ nahual, kins }) => {
                const glifo = getNahualGlifo(nahual);
                const isExpanded = expandedNahual === nahual;
                
                return (
                  <div key={nahual} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedNahual(isExpanded ? null : nahual)}
                      className="w-full flex items-center justify-between p-4 bg-card hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        {glifo && (
                          <img 
                            src={glifo} 
                            alt={nahual} 
                            className="w-10 h-10 rounded-lg object-cover"
                            loading="lazy"
                          />
                        )}
                        <div>
                          <h2 className="font-semibold">{nahual}</h2>
                          <p className="text-sm text-muted-foreground">13 Kin</p>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    
                    {isExpanded && (
                      <div className="p-4 pt-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 animate-fade-in">
                        {kins.map(kin => (
                          <Link
                            key={kin.slug}
                            to={`/kin/${kin.slug}`}
                            className="bg-muted/50 hover:bg-primary/10 border border-transparent hover:border-primary rounded-lg p-3 text-center transition-all"
                          >
                            <p className="font-medium text-primary">{kin.tono}</p>
                            <p className="text-xs text-muted-foreground">Kin {kin.kinNumber}</p>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          )}

          {/* SEO Content */}
          <section className="mt-16 prose prose-sm max-w-3xl mx-auto">
            <h2>¿Qué es un Kin Maya?</h2>
            <p>
              En el calendario sagrado Maya Cholq'ij (también conocido como Tzolkin), un <strong>Kin</strong> representa 
              un día único con su propia energía cósmica. El ciclo completo consta de 260 días, formados por la 
              combinación de 20 Nahuales (energías o signos) con 13 Tonos (números sagrados del 1 al 13).
            </p>
            
            <h3>Los 20 Nahuales</h3>
            <p>
              Cada Nahual representa una energía arquetípica: {nahualOrder.join(', ')}. Cada uno tiene su 
              significado, elemento, color de maíz, y punto cardinal asociado.
            </p>

            <h3>Los 13 Tonos</h3>
            <p>
              Los Tonos del 1 al 13 representan diferentes cualidades numéricas sagradas: desde la unidad 
              del propósito (1) hasta la trascendencia (13). Cada tono modifica la expresión del Nahual.
            </p>

            <h3>Calcula tu Kin de Nacimiento</h3>
            <p>
              Tu fecha de nacimiento determina tu Kin personal, que revela tu misión de vida y 
              características según la cosmovisión Maya. 
              <Link to="/" className="text-primary hover:underline ml-1">
                Descubre tu Nahual →
              </Link>
            </p>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t py-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Azul Anaité. Calendario Maya Cholq'ij.</p>
        </footer>
      </div>
    </>
  );
}
