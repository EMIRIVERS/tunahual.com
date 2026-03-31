import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tono } from '@/hooks/useAdminData';
import { Edit, X, Plus } from 'lucide-react';

interface TonoEditorProps {
  tonos: Tono[];
  onUpdate: (id: string, updates: Partial<Tono>) => Promise<boolean>;
}

export function TonoEditor({ tonos, onUpdate }: TonoEditorProps) {
  const [editingTono, setEditingTono] = useState<Tono | null>(null);
  const [formData, setFormData] = useState<Partial<Tono>>({});
  const [newCualidad, setNewCualidad] = useState('');
  const [saving, setSaving] = useState(false);

  const openEditor = (tono: Tono) => {
    setEditingTono(tono);
    setFormData({ ...tono });
  };

  const handleSave = async () => {
    if (!editingTono) return;
    setSaving(true);
    const success = await onUpdate(editingTono.id, formData);
    setSaving(false);
    if (success) setEditingTono(null);
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

  if (tonos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tonos</CardTitle>
          <CardDescription>
            No hay tonos en la base de datos. Ejecuta el script de migración de datos para poblar las tablas.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editor de Tonos</CardTitle>
        <CardDescription>
          Edita los 13 tonos del calendario maya
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tonos.map((tono) => (
            <Dialog key={tono.id}>
              <DialogTrigger asChild>
                <Card 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => openEditor(tono)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                        {tono.numero}
                      </div>
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-lg">{tono.nombre}</CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {tono.significado}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </DialogTrigger>
              
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Editar Tono {tono.numero} - {tono.nombre}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-4">
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Número</Label>
                        <Input
                          type="number"
                          value={formData.numero || ''}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nombre</Label>
                        <Input
                          value={formData.nombre || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Significado</Label>
                      <Input
                        value={formData.significado || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, significado: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Descripción</Label>
                      <Textarea
                        value={formData.descripcion || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                        rows={4}
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
