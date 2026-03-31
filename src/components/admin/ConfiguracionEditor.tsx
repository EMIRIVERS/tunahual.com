import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, ShieldCheck, Lock, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/25922170/uwis3fg/';
const ALREADY_SENT_COUNT = 638; // Total enviados hasta ahora

export function ConfiguracionEditor() {
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState({ sent: 0, total: 0 });
  const [sendComplete, setSendComplete] = useState(false);
  const { toast } = useToast();

  const sendRemainingLeadsToZapier = async () => {
    setIsSending(true);
    setSendComplete(false);
    setSendProgress({ sent: 0, total: 0 });

    try {
      // Get all leads ordered by creation date
      const { data: allLeads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get unique leads by email (first occurrence only)
      const uniqueLeads: typeof allLeads = [];
      const seenEmails = new Set<string>();

      for (const lead of allLeads || []) {
        const emailLower = lead.email.toLowerCase().trim();
        if (!seenEmails.has(emailLower)) {
          seenEmails.add(emailLower);
          uniqueLeads.push(lead);
        }
      }

      // Skip the first 296 that were already sent
      const leadsToSend = uniqueLeads.slice(ALREADY_SENT_COUNT);
      
      setSendProgress({ sent: 0, total: leadsToSend.length });

      if (leadsToSend.length === 0) {
        toast({
          title: 'No hay leads nuevos',
          description: `Ya se enviaron los ${ALREADY_SENT_COUNT} primeros leads únicos. No hay más pendientes.`,
        });
        setIsSending(false);
        return;
      }

      let sentCount = 0;

      for (const lead of leadsToSend) {
        try {
          await fetch(ZAPIER_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            mode: 'no-cors',
            body: JSON.stringify({
              nombre: lead.nombre,
              email: lead.email,
              telefono: lead.telefono || '',
              fecha_nacimiento: lead.fecha_nacimiento,
              nahual: lead.nahual || '',
              tono: lead.tono || 0,
              kin_completo: lead.kin_completo || '',
              timestamp: new Date().toISOString(),
            }),
          });
          
          sentCount++;
          setSendProgress({ sent: sentCount, total: leadsToSend.length });
          
          // Small delay to avoid overwhelming Zapier
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (fetchError) {
          console.error('Error sending lead:', lead.email, fetchError);
        }
      }

      setSendComplete(true);
      toast({
        title: '¡Envío completado!',
        description: `Se enviaron ${sentCount} leads únicos a Zapier/Kajabi.`,
      });
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron obtener los leads.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Enviar Leads Pendientes a Kajabi
          </CardTitle>
          <CardDescription>
            Envía los leads únicos que aún no se han enviado (después de los primeros {ALREADY_SENT_COUNT})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm">
            <p className="font-medium text-amber-700 mb-1">Información:</p>
            <ul className="text-muted-foreground space-y-1">
              <li>• Se filtran emails duplicados (solo se envía el primer registro)</li>
              <li>• Se omiten los primeros {ALREADY_SENT_COUNT} leads únicos (ya enviados)</li>
              <li>• Se envían todos los leads restantes</li>
            </ul>
          </div>

          {sendProgress.total > 0 && (
            <div className="p-4 bg-primary/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progreso</span>
                <span className="text-sm text-muted-foreground">
                  {sendProgress.sent} / {sendProgress.total}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(sendProgress.sent / sendProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {sendComplete && (
            <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-green-700 font-medium">¡Envío completado exitosamente!</span>
            </div>
          )}

          <Button 
            onClick={sendRemainingLeadsToZapier}
            disabled={isSending}
            className="w-full"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando leads...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Leads Pendientes a Zapier
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Integración con Zapier / Kajabi
          </CardTitle>
          <CardDescription>
            Configuración del webhook para enviar automáticamente los leads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <ShieldCheck className="h-6 w-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-700">Webhook Configurado</p>
              <p className="text-sm text-muted-foreground">
                URL: hooks.zapier.com/hooks/catch/25922170/uwis3fg/
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p>Los nuevos leads se envían automáticamente a Zapier cuando se registran.</p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
            <p className="font-medium">Datos que se envían al webhook:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>nombre, email, telefono</li>
              <li>fecha_nacimiento</li>
              <li>nahual, tono, kin_completo</li>
              <li>timestamp</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
