import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type AuthMode = 'login' | 'signup' | 'forgot';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, loading, signIn, signUp } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<AuthMode>('login');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) {
          toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
          toast({ 
            title: 'Cuenta creada', 
            description: 'Tu cuenta ha sido creada. Contacta al administrador para obtener acceso.' 
          });
        }
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/admin/reset-password`,
        });
        if (error) {
          toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
          toast({ 
            title: 'Correo enviado', 
            description: 'Revisa tu bandeja de entrada para restablecer tu contraseña.' 
          });
          setMode('login');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Acceso Denegado</CardTitle>
            <CardDescription>
              No tienes permisos de administrador. Contacta al administrador del sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/')}
            >
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTitle = () => {
    switch (mode) {
      case 'signup': return 'Crear cuenta';
      case 'forgot': return 'Recuperar contraseña';
      default: return 'Panel de Administración';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'signup': return 'Crear cuenta de administrador';
      case 'forgot': return 'Ingresa tu correo para recibir instrucciones';
      default: return 'Inicia sesión para acceder';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            {getTitle()}
          </CardTitle>
          <CardDescription>
            {getDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ejemplo.com"
                required
              />
            </div>
            
            {mode !== 'forgot' && (
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'signup' ? 'Crear Cuenta' : mode === 'forgot' ? 'Enviar Correo' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-4 space-y-2 text-center">
            {mode === 'login' && (
              <>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-sm text-muted-foreground hover:text-primary block w-full"
                >
                  ¿Olvidaste tu contraseña?
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-sm text-muted-foreground hover:text-primary block w-full"
                >
                  ¿No tienes cuenta? Regístrate
                </button>
              </>
            )}
            {mode === 'signup' && (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-1 w-full"
              >
                <ArrowLeft className="w-3 h-3" />
                Volver a iniciar sesión
              </button>
            )}
            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-1 w-full"
              >
                <ArrowLeft className="w-3 h-3" />
                Volver a iniciar sesión
              </button>
            )}
          </div>

          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              Volver al Inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
