import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Guardian } from '@/hooks/useAdminData';
import { Edit, Plus, Trash2, Shield } from 'lucide-react';

interface GuardianEditorProps {
  guardianes: Guardian[];
  onCreate: (guardian: Omit<Guardian, 'id'>) => Promise<boolean>;
  onUpdate: (id: string, updates: Partial<Guardian>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export function GuardianEditor({ guardianes, onCreate, onUpdate, onDelete }: GuardianEditorProps) {
  const [editingGuardian, setEditingGuardian] = useState<Guardian | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Guardian>>({});
  const [saving, setSaving] = useState(false);

  const openEditor = (guardian: Guardian) => {
    setEditingGuardian(guardian);
    setFormData({ ...guardian });
    setIsCreating(false);
  };

  const openCreate = () => {
    setEditingGuardian(null);
    setFormData({ nombre: '', nombre_maya: '', significado: '', invocacion: '' });
    setIsCreating(true);
  };

  const handleSave = async () => {
    setSaving(true);
    let success = false;
    
    if (isCreating) {
      success = await onCreate({
        nombre: formData.nombre || '',
        nombre_maya: formData.nombre_maya || '',
        significado: formData.significado || '',
        invocacion: formData.invocacion || null
      });
    } else if (editingGuardian) {
      success = await onUpdate(editingGuardian.id, formData);
    }
    
    setSaving(false);
    if (success) {
      setEditingGuardian(null);
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
            <CardTitle>Editor de Guardianes</CardTitle>
            <CardDescription>
              Deidades y fuerzas espirituales mayas
            </CardDescription>
          </div>
          <Dialog open={isCreating} onOpenChange={(open) => !open && setIsCreating(false)}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Guardián
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Guardián</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input
                      value={formData.nombre || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                      placeholder="Nombre del guardián"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre Maya</Label>
                    <Input
                      value={formData.nombre_maya || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, nombre_maya: e.target.value }))}
                      placeholder="Nombre en maya"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Significado</Label>
                  <Textarea
                    value={formData.significado || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, significado: e.target.value }))}
                    rows={3}
                    placeholder="Significado y simbolismo"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Invocación (opcional)</Label>
                  <Textarea
                    value={formData.invocacion || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, invocacion: e.target.value }))}
                    rows={4}
                    placeholder="Texto de invocación"
                  />
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? 'Guardando...' : 'Crear Guardián'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {guardianes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay guardianes en la base de datos. Haz clic en "Nuevo Guardián" para agregar uno.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guardianes.map((guardian) => (
              <Card key={guardian.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <Shield className="h-5 w-5 text-primary" />
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => openEditor(guardian)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl">
                          <DialogHeader>
                            <DialogTitle>Editar {guardian.nombre}</DialogTitle>
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
                                <Label>Significado</Label>
                                <Textarea
                                  value={formData.significado || ''}
                                  onChange={(e) => setFormData(prev => ({ ...prev, significado: e.target.value }))}
                                  rows={3}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Invocación</Label>
                                <Textarea
                                  value={formData.invocacion || ''}
                                  onChange={(e) => setFormData(prev => ({ ...prev, invocacion: e.target.value }))}
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
                            <AlertDialogTitle>¿Eliminar guardián?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente "{guardian.nombre}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(guardian.id)}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <CardTitle className="text-base">{guardian.nombre}</CardTitle>
                  <CardDescription className="text-xs text-primary">
                    {guardian.nombre_maya}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {guardian.significado}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
