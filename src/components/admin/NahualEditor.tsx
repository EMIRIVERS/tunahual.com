import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Nahual } from '@/hooks/useAdminData';
import { Edit, X, Plus } from 'lucide-react';

interface NahualEditorProps {
  nahuales: Nahual[];
  onUpdate: (id: string, updates: Partial<Nahual>) => Promise<boolean>;
}

export function NahualEditor({ nahuales, onUpdate }: NahualEditorProps) {
  const [editingNahual, setEditingNahual] = useState<Nahual | null>(null);
  const [formData, setFormData] = useState<Partial<Nahual>>({});
  const [newCualidad, setNewCualidad] = useState('');
  const [newSombra, setNewSombra] = useState('');
  const [saving, setSaving] = useState(false);

  const openEditor = (nahual: Nahual) => {
    setEditingNahual(nahual);
    setFormData({ ...nahual });
  };

  const handleSave = async () => {
    if (!editingNahual) return;
    setSaving(true);
    const success = await onUpdate(editingNahual.id, formData);
    setSaving(false);
    if (success) setEditingNahual(null);
  };

  const addCualidad = () => {
    if (newCualidad.trim()) {
      setFormData(prev => ({
        ...prev,
        cualidades: [...(prev.cualidades || []), newCualidad.trim()]
      }));
      setNewCualidad('');
    }
  };

  const removeCualidad = (index: number) => {
    setFormData(prev => ({
      ...prev,
      cualidades: (prev.cualidades || []).filter((_, i) => i !== index)
    }));
  };

  const addSombra = () => {
    if (newSombra.trim()) {
      setFormData(prev => ({
        ...prev,
        sombras: [...(prev.sombras || []), newSombra.trim()]
      }));
      setNewSombra('');
    }
  };

  const removeSombra = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sombras: (prev.sombras || []).filter((_, i) => i !== index)
    }));
  };

  if (nahuales.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nahuales</CardTitle>
          <CardDescription>
            No hay nahuales en la base de datos. Ejecuta el script de migración de datos para poblar las tablas.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editor de Nahuales</CardTitle>
        <CardDescription>
          Edita los 20 signos del calendario maya
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {nahuales.map((nahual) => (
            <Dialog key={nahual.id}>
              <DialogTrigger asChild>
                <Card 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => openEditor(nahual)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{nahual.index_num}</Badge>
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-lg">{nahual.nombre}</CardTitle>
                    <CardDescription className="text-sm">
                      {nahual.significado}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">{nahual.elemento}</Badge>
                      <Badge variant="secondary" className="text-xs">{nahual.punto_cardinal}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              
              <DialogContent className="max-w-2xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Editar {nahual.nombre}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-4">
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nombre</Label>
                        <Input
                          value={formData.nombre || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Significado</Label>
                        <Input
                          value={formData.significado || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, significado: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Descripción</Label>
                      <Textarea
                        value={formData.descripcion || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Elemento</Label>
                        <Input
                          value={formData.elemento || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, elemento: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Glifo</Label>
                        <Input
                          value={formData.animal_guia || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, animal_guia: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Punto Cardinal</Label>
                        <Input
                          value={formData.punto_cardinal || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, punto_cardinal: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Color de Maíz</Label>
                        <Input
                          value={formData.color_maiz || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, color_maiz: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Parte del Cuerpo</Label>
                        <Input
                          value={formData.parte_cuerpo || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, parte_cuerpo: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Lugar del Poder</Label>
                        <Input
                          value={formData.lugar_poder || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, lugar_poder: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Elemento de Conexión</Label>
                      <Input
                        value={formData.elemento_conexion || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, elemento_conexion: e.target.value }))}
                      />
                    </div>

                    {/* Cualidades */}
                    <div className="space-y-2">
                      <Label>Cualidades</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(formData.cualidades || []).map((c, i) => (
                          <Badge key={i} variant="secondary" className="flex items-center gap-1">
                            {c}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => removeCualidad(i)}
                            />
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newCualidad}
                          onChange={(e) => setNewCualidad(e.target.value)}
                          placeholder="Nueva cualidad..."
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCualidad())}
                        />
                        <Button type="button" variant="outline" size="icon" onClick={addCualidad}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Sombras */}
                    <div className="space-y-2">
                      <Label>Sombras (Aspectos a trabajar)</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(formData.sombras || []).map((s, i) => (
                          <Badge key={i} variant="outline" className="flex items-center gap-1">
                            {s}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => removeSombra(i)}
                            />
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newSombra}
                          onChange={(e) => setNewSombra(e.target.value)}
                          placeholder="Nueva sombra..."
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSombra())}
                        />
                        <Button type="button" variant="outline" size="icon" onClick={addSombra}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Button onClick={handleSave} disabled={saving} className="w-full">
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
