import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/hooks/useAdminData';
import { Search, RefreshCw, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Datos estáticos de nahuales para mostrar información derivada
const nahualData: Record<string, { puntoCardinal: string; colorMaiz: string; elemento: string; animalGuia: string }> = {
  'Imox': { puntoCardinal: 'Este', colorMaiz: 'Rojo', elemento: 'Agua', animalGuia: 'Lagarto' },
  "Iq'": { puntoCardinal: 'Norte', colorMaiz: 'Blanco', elemento: 'Aire', animalGuia: 'Colibrí' },
  "Aq'ab'al": { puntoCardinal: 'Oeste', colorMaiz: 'Negro', elemento: 'Luz y Oscuridad', animalGuia: 'Murciélago' },
  "K'at": { puntoCardinal: 'Sur', colorMaiz: 'Amarillo', elemento: 'Fuego', animalGuia: 'Araña' },
  'Kan': { puntoCardinal: 'Este', colorMaiz: 'Rojo', elemento: 'Fuego', animalGuia: 'Quétzal' },
  'Kame': { puntoCardinal: 'Norte', colorMaiz: 'Blanco', elemento: 'Tierra', animalGuia: 'Lechuza' },
  'Kej': { puntoCardinal: 'Oeste', colorMaiz: 'Negro', elemento: 'Aire', animalGuia: 'Venado' },
  "Q'anil": { puntoCardinal: 'Sur', colorMaiz: 'Amarillo', elemento: 'Tierra', animalGuia: 'Conejo' },
  'Toj': { puntoCardinal: 'Este', colorMaiz: 'Rojo', elemento: 'Fuego', animalGuia: 'Fuego' },
  "Tz'i'": { puntoCardinal: 'Norte', colorMaiz: 'Blanco', elemento: 'Agua', animalGuia: 'Perro/Coyote' },
  "B'atz'": { puntoCardinal: 'Oeste', colorMaiz: 'Negro', elemento: 'Aire', animalGuia: 'Mono' },
  'E': { puntoCardinal: 'Sur', colorMaiz: 'Amarillo', elemento: 'Tierra', animalGuia: 'Gato Montés' },
  'Aj': { puntoCardinal: 'Este', colorMaiz: 'Rojo', elemento: 'Fuego', animalGuia: 'Armadillo' },
  "I'x": { puntoCardinal: 'Norte', colorMaiz: 'Blanco', elemento: 'Tierra', animalGuia: 'Jaguar' },
  "Tz'ikin": { puntoCardinal: 'Oeste', colorMaiz: 'Negro', elemento: 'Aire', animalGuia: 'Águila/Quetzal' },
  'Ajmaq': { puntoCardinal: 'Sur', colorMaiz: 'Amarillo', elemento: 'Tierra', animalGuia: 'Abeja' },
  "No'j": { puntoCardinal: 'Este', colorMaiz: 'Rojo', elemento: 'Aire', animalGuia: 'Pájaro Carpintero' },
  'Tijax': { puntoCardinal: 'Norte', colorMaiz: 'Blanco', elemento: 'Fuego', animalGuia: 'Cuchillo de Obsidiana' },
  'Kawoq': { puntoCardinal: 'Oeste', colorMaiz: 'Negro', elemento: 'Agua', animalGuia: 'Tortuga' },
  'Ajpu': { puntoCardinal: 'Sur', colorMaiz: 'Amarillo', elemento: 'Fuego', animalGuia: 'Guardián del Sol' },
};

interface LeadsTableProps {
  leads: Lead[];
  onRefresh: () => void;
}

const ITEMS_PER_PAGE = 10;

export function LeadsTable({ leads, onRefresh }: LeadsTableProps) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [exportFrom, setExportFrom] = useState('');

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => 
      lead.nombre.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      (lead.nahual && lead.nahual.toLowerCase().includes(search.toLowerCase()))
    );
  }, [leads, search]);

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const generateCSV = (leadsToExport: Lead[]) => {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Fecha Nacimiento', 'Nahual', 'Tono', 'Kin', 'Punto Cardinal', 'Color Maíz', 'Elemento', 'Glifo', 'Fecha Registro'];
    const rows = leadsToExport.map(lead => {
      const nahual = lead.nahual ? nahualData[lead.nahual] : null;
      return [
        `"${lead.nombre.replace(/"/g, '""')}"`,
        lead.email,
        lead.telefono || '',
        lead.fecha_nacimiento,
        lead.nahual || '',
        lead.tono?.toString() || '',
        lead.kin_completo || '',
        nahual?.puntoCardinal || '',
        nahual?.colorMaiz || '',
        nahual?.elemento || '',
        nahual?.animalGuia || '',
        format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm', { locale: es })
      ].join(',');
    });
    
    return [headers.join(','), ...rows].join('\n');
  };

  const exportToCSV = () => {
    const csv = generateCSV(filteredLeads);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const exportFromNumber = () => {
    const startIndex = parseInt(exportFrom) - 1;
    if (isNaN(startIndex) || startIndex < 0 || startIndex >= leads.length) {
      return;
    }
    const leadsToExport = leads.slice(startIndex);
    const csv = generateCSV(leadsToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_desde_${exportFrom}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              Registros de Leads
              <Badge variant="secondary">{filteredLeads.length}</Badge>
            </CardTitle>
            <CardDescription>
              Lista de todos los usuarios que han calculado su Nahual Maya
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                placeholder="Desde #"
                value={exportFrom}
                onChange={(e) => setExportFrom(e.target.value)}
                className="w-24 h-8 text-sm"
                min={1}
                max={leads.length}
              />
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={exportFromNumber}
                disabled={!exportFrom || parseInt(exportFrom) < 1 || parseInt(exportFrom) > leads.length}
              >
                <Download className="h-4 w-4 mr-1" />
                Desde #{exportFrom || '...'}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o nahual..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>F. Nacimiento</TableHead>
                <TableHead>Nahual</TableHead>
                <TableHead>Tono</TableHead>
                <TableHead>P. Cardinal</TableHead>
                <TableHead>Color Maíz</TableHead>
                <TableHead>Elemento</TableHead>
                <TableHead>Registro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                    No se encontraron registros
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLeads.map((lead) => {
                  const nahual = lead.nahual ? nahualData[lead.nahual] : null;
                  return (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.nombre}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.telefono || '-'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {lead.fecha_nacimiento ? format(new Date(lead.fecha_nacimiento + 'T00:00:00'), 'dd/MM/yyyy', { locale: es }) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{lead.nahual || '-'}</Badge>
                      </TableCell>
                      <TableCell>{lead.tono || '-'}</TableCell>
                      <TableCell>{nahual?.puntoCardinal || '-'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className={
                            nahual?.colorMaiz === 'Rojo' ? 'bg-red-100 text-red-800' :
                            nahual?.colorMaiz === 'Negro' ? 'bg-gray-800 text-white' :
                            nahual?.colorMaiz === 'Blanco' ? 'bg-gray-100 text-gray-800' :
                            nahual?.colorMaiz === 'Amarillo' ? 'bg-yellow-100 text-yellow-800' : ''
                          }
                        >
                          {nahual?.colorMaiz || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>{nahual?.elemento || '-'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(lead.created_at), 'dd/MM/yy', { locale: es })}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredLeads.length)} de {filteredLeads.length}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="flex items-center px-3 text-sm">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
