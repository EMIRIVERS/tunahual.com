import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ConceptoFundamental } from '@/hooks/useAdminData';
import { Edit, Plus, Trash2, BookOpen } from 'lucide-react';

interface ConceptoEditorProps {
  conceptos: ConceptoFundamental[];
  onCreate: (concepto: Omit<ConceptoFundamental, 'id'>) => Promise<boolean>;
  onUpdate: (id: string, updates: Partial<ConceptoFundamental>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export function ConceptoEditor({ conceptos, onCreate, onUpdate, onDelete }: ConceptoEditorProps) {
  const [editingConcepto, setEditingConcepto] = useState<ConceptoFundamental | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<ConceptoFundamental>>({});
  const [saving, setSaving] = useState(false);

  const openEditor = (concepto: ConceptoFundamental) => {
    setEditingConcepto(concepto);
    setFormData({ ...concepto });
    setIsCreating(false);
  };

  const openCreate = () => {
    setEditingConcepto(null);
    setFormData({ nombre: '', nombre_maya: '', descripcion: '', ensenanza: '' });
    setIsCreating(true);
  };

  const handleSave = async () => {
    setSaving(true);
    let success = false;
    
    if (isCreating) {
      success = await onCreate({
        nombre: formData.nombre || '',
        nombre_maya: formData.nombre_maya || null,
        descripcion: formData.descripcion || '',
        ensenanza: formData.ensenanza || ''
      });
    } else if (editingConcepto) {
      success = await onUpdate(editingConcepto.id, formData);
    }
    
    setSaving(false);
    if (success) {
      setEditingConcepto(null);
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    await onDelete(id);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Editor de Conceptos</CardTitle>
            <CardDescription>
              Conceptos fundamentales de la cosmovisión maya
            </CardDescription>
          </div>
          <Dialog open={isCreating} onOpenChange={(open) => !open && setIsCreating(false)}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Concepto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Concepto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input
                      value={formData.nombre || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                      placeholder="Nombre del concepto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre Maya (opcional)</Label>
                    <Input
                      value={formData.nombre_maya || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, nombre_maya: e.target.value }))}
                      placeholder="Nombre en maya"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea
                    value={formData.descripcion || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                    rows={3}
                    placeholder="Descripción del concepto"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Enseñanza</Label>
                  <Textarea
                    value={formData.ensenanza || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, ensenanza: e.target.value }))}
                    rows={4}
                    placeholder="Enseñanza espiritual"
                  />
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? 'Guardando...' : 'Crear Concepto'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {conceptos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay conceptos en la base de datos. Haz clic en "Nuevo Concepto" para agregar uno.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conceptos.map((concepto) => (
              <Card key={concepto.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => openEditor(concepto)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl">
                          <DialogHeader>
                            <DialogTitle>Editar {concepto.nombre}</DialogTitle>
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
                                  <Label>Nombre Maya</Label>
                                  <Input
                                    value={formData.nombre_maya || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, nombre_maya: e.target.value }))}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>Descripción</Label>
                                <Textarea
                                  value={formData.descripcion || ''}
                                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                                  rows={3}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Enseñanza</Label>
                                <Textarea
                                  value={formData.ensenanza || ''}
                                  onChange={(e) => setFormData(prev => ({ ...prev, ensenanza: e.target.value }))}
                                  rows={4}
                                />
                              </div>

                              <Button onClick={handleSave} disabled={saving} className="w-full">
                                {saving ? 'Guardando...' : 'Guardar Cambios'}
                              </Button>
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar concepto?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente "{concepto.nombre}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(concepto.id)}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <CardTitle className="text-base">{concepto.nombre}</CardTitle>
                  {concepto.nombre_maya && (
                    <CardDescription className="text-xs text-primary">
                      {concepto.nombre_maya}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {concepto.descripcion}
                  </p>
                  <div className="border-t pt-2">
                    <p className="text-xs font-medium text-primary">Enseñanza:</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {concepto.ensenanza}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
