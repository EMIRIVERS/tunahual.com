import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAdminData } from '@/hooks/useAdminData';
import { LeadsTable } from '@/components/admin/LeadsTable';
import { LeadsStats } from '@/components/admin/LeadsStats';
import { NahualEditor } from '@/components/admin/NahualEditor';
import { TonoEditor } from '@/components/admin/TonoEditor';
import { GuardianEditor } from '@/components/admin/GuardianEditor';
import { ConceptoEditor } from '@/components/admin/ConceptoEditor';
import { ConfiguracionEditor } from '@/components/admin/ConfiguracionEditor';
import { Loader2, LogOut, Home, Users, BarChart3, Sun, Hash, Shield, BookOpen, RefreshCcw, Settings } from 'lucide-react';
export default function Admin() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const adminData = useAdminData();

  useEffect(() => {
    // Only redirect if we've finished loading AND user is definitely not authenticated
    if (!authLoading && !user) {
      navigate('/admin/login');
    }
  }, [user, authLoading, navigate]);

  // Separate effect for admin check - only after we know user exists and auth is done
  useEffect(() => {
    if (!authLoading && user && isAdmin === false) {
      // Give a small delay to allow isAdmin to update from the RPC call
      const timer = setTimeout(() => {
        if (!isAdmin) {
          navigate('/admin/login');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Show loading while checking auth or admin status
  if (authLoading || adminData.loading || (user && isAdmin === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  if (!user || isAdmin === false) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Panel de Administración</h1>
            <p className="text-sm text-muted-foreground">Calendario Maya - Azul Anaité</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => adminData.refreshAll()}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" />
              Inicio
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="leads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 gap-2 h-auto p-2">
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Leads</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Estadísticas</span>
            </TabsTrigger>
            <TabsTrigger value="nahuales" className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              <span className="hidden sm:inline">Nahuales</span>
            </TabsTrigger>
            <TabsTrigger value="tonos" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              <span className="hidden sm:inline">Tonos</span>
            </TabsTrigger>
            <TabsTrigger value="guardianes" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Guardianes</span>
            </TabsTrigger>
            <TabsTrigger value="conceptos" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Conceptos</span>
            </TabsTrigger>
            <TabsTrigger value="configuracion" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leads">
            <LeadsTable leads={adminData.leads} onRefresh={adminData.refreshAll} />
          </TabsContent>

          <TabsContent value="stats">
            <LeadsStats leads={adminData.leads} />
          </TabsContent>

          <TabsContent value="nahuales">
            <NahualEditor 
              nahuales={adminData.nahuales} 
              onUpdate={adminData.updateNahual} 
            />
          </TabsContent>

          <TabsContent value="tonos">
            <TonoEditor 
              tonos={adminData.tonos} 
              onUpdate={adminData.updateTono} 
            />
          </TabsContent>

          <TabsContent value="guardianes">
            <GuardianEditor 
              guardianes={adminData.guardianes}
              onCreate={adminData.createGuardian}
              onUpdate={adminData.updateGuardian}
              onDelete={adminData.deleteGuardian}
            />
          </TabsContent>

          <TabsContent value="conceptos">
            <ConceptoEditor 
              conceptos={adminData.conceptos}
              onCreate={adminData.createConcepto}
              onUpdate={adminData.updateConcepto}
              onDelete={adminData.deleteConcepto}
            />
          </TabsContent>

          <TabsContent value="configuracion">
            <ConfiguracionEditor />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
