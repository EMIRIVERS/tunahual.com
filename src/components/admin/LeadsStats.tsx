import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lead } from '@/hooks/useAdminData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, Calendar, Sun, Hash } from 'lucide-react';

interface LeadsStatsProps {
  leads: Lead[];
}

const COLORS = ['hsl(35, 60%, 40%)', 'hsl(52, 65%, 50%)', 'hsl(0, 60%, 50%)', 'hsl(200, 60%, 50%)', 'hsl(120, 40%, 45%)', 'hsl(280, 50%, 50%)', 'hsl(30, 70%, 50%)', 'hsl(180, 50%, 45%)'];

const nahualData: Record<string, { puntoCardinal: string; colorMaiz: string; elemento: string }> = {
  'Imox': { puntoCardinal: 'Este', colorMaiz: 'Negro', elemento: 'Agua' },
  "Iq'": { puntoCardinal: 'Norte', colorMaiz: 'Blanco', elemento: 'Aire' },
  "Aq'ab'al": { puntoCardinal: 'Oeste', colorMaiz: 'Negro', elemento: 'Luz y Oscuridad' },
  "K'at": { puntoCardinal: 'Sur', colorMaiz: 'Amarillo', elemento: 'Fuego' },
  'Kan': { puntoCardinal: 'Este', colorMaiz: 'Rojo', elemento: 'Fuego' },
  'Kame': { puntoCardinal: 'Norte', colorMaiz: 'Negro', elemento: 'Tierra' },
  'Kej': { puntoCardinal: 'Oeste', colorMaiz: 'Blanco', elemento: 'Aire' },
  "Q'anil": { puntoCardinal: 'Sur', colorMaiz: 'Amarillo', elemento: 'Tierra' },
  'Toj': { puntoCardinal: 'Este', colorMaiz: 'Rojo', elemento: 'Fuego' },
  "Tz'i'": { puntoCardinal: 'Norte', colorMaiz: 'Blanco', elemento: 'Agua' },
  "B'atz'": { puntoCardinal: 'Oeste', colorMaiz: 'Rojo', elemento: 'Aire' },
  'E': { puntoCardinal: 'Sur', colorMaiz: 'Negro', elemento: 'Tierra' },
  'Aj': { puntoCardinal: 'Este', colorMaiz: 'Amarillo', elemento: 'Fuego' },
  "I'x": { puntoCardinal: 'Norte', colorMaiz: 'Negro', elemento: 'Tierra' },
  "Tz'ikin": { puntoCardinal: 'Oeste', colorMaiz: 'Amarillo', elemento: 'Aire' },
  'Ajmaq': { puntoCardinal: 'Sur', colorMaiz: 'Amarillo', elemento: 'Tierra' },
  "No'j": { puntoCardinal: 'Este', colorMaiz: 'Blanco', elemento: 'Aire' },
  'Tijax': { puntoCardinal: 'Norte', colorMaiz: 'Rojo', elemento: 'Fuego' },
  'Kawoq': { puntoCardinal: 'Oeste', colorMaiz: 'Negro', elemento: 'Agua' },
  'Ajpu': { puntoCardinal: 'Sur', colorMaiz: 'Rojo', elemento: 'Fuego' },
};

export function LeadsStats({ leads }: LeadsStatsProps) {
  const stats = useMemo(() => {
    // Nahual distribution
    const nahualCount: Record<string, number> = {};
    const tonoCount: Record<number, number> = {};
    const puntoCardinalCount: Record<string, number> = {};
    const colorMaizCount: Record<string, number> = {};
    const elementoCount: Record<string, number> = {};

    leads.forEach(lead => {
      if (lead.nahual) {
        nahualCount[lead.nahual] = (nahualCount[lead.nahual] || 0) + 1;
        
        const data = nahualData[lead.nahual];
        if (data) {
          puntoCardinalCount[data.puntoCardinal] = (puntoCardinalCount[data.puntoCardinal] || 0) + 1;
          colorMaizCount[data.colorMaiz] = (colorMaizCount[data.colorMaiz] || 0) + 1;
          elementoCount[data.elemento] = (elementoCount[data.elemento] || 0) + 1;
        }
      }
      if (lead.tono) {
        tonoCount[lead.tono] = (tonoCount[lead.tono] || 0) + 1;
      }
    });

    const nahualChartData = Object.entries(nahualCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const tonoChartData = Array.from({ length: 13 }, (_, i) => ({
      name: `Tono ${i + 1}`,
      value: tonoCount[i + 1] || 0
    }));

    const puntoCardinalData = Object.entries(puntoCardinalCount)
      .map(([name, value]) => ({ name, value }));

    const colorMaizData = Object.entries(colorMaizCount)
      .map(([name, value]) => ({ name, value }));

    const elementoData = Object.entries(elementoCount)
      .map(([name, value]) => ({ name, value }));

    // Most common
    const topNahual = nahualChartData[0]?.name || '-';
    const topTono = tonoChartData.reduce((a, b) => a.value > b.value ? a : b, { name: '-', value: 0 }).name;

    return {
      total: leads.length,
      nahualChartData,
      tonoChartData,
      puntoCardinalData,
      colorMaizData,
      elementoData,
      topNahual,
      topTono
    };
  }, [leads]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-3xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nahual más común</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{stats.topNahual}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tono más común</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{stats.topTono}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Este mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-3xl font-bold">
                {leads.filter(l => new Date(l.created_at).getMonth() === new Date().getMonth()).length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nahual Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Nahuales</CardTitle>
            <CardDescription>Los 20 signos del calendario maya</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.nahualChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(35, 60%, 40%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tono Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Tonos</CardTitle>
            <CardDescription>Los 13 tonos del calendario</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.tonoChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(52, 65%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Punto Cardinal */}
        <Card>
          <CardHeader>
            <CardTitle>Puntos Cardinales</CardTitle>
            <CardDescription>Distribución por dirección</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.puntoCardinalData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.puntoCardinalData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Color Maíz */}
        <Card>
          <CardHeader>
            <CardTitle>Colores de Maíz</CardTitle>
            <CardDescription>Los 5 colores sagrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.colorMaizData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.colorMaizData.map((entry, index) => {
                      const colorMap: Record<string, string> = {
                        'Rojo': '#dc2626',
                        'Negro': '#1f2937',
                        'Blanco': '#f3f4f6',
                        'Amarillo': '#eab308',
                        'Gris': '#9ca3af'
                      };
                      return <Cell key={`cell-${index}`} fill={colorMap[entry.name] || COLORS[index]} />;
                    })}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Elementos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Distribución por Elementos</CardTitle>
            <CardDescription>Los elementos de la naturaleza</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.elementoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {stats.elementoData.map((entry, index) => {
                      const colorMap: Record<string, string> = {
                        'Agua': '#3b82f6',
                        'Fuego': '#ef4444',
                        'Tierra': '#84cc16',
                        'Aire': '#a855f7',
                        'Luz y Oscuridad': '#6b7280'
                      };
                      return <Cell key={`cell-${index}`} fill={colorMap[entry.name] || COLORS[index]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
