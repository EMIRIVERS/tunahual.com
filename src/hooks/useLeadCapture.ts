import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import { nahualToSlug } from "@/data/nahualSlugs";

const LEAD_FLAG_KEY = "tunahual_cruz_abierta";

export interface DatosLead {
  nombre: string;
  email: string;
  telefono: string;
  /** YYYY-MM-DD */
  fechaNacimiento: string;
  nahual: { nombre: string; significado?: string | null; descripcion?: string | null };
  /** Ausente en páginas de un nahual sin tono (/nahual/:slug). */
  tono?: number | null;
  /** Desde dónde se captó (home, kin, nahual, resultado). */
  origen?: string;
}

function leerBandera(): boolean {
  try {
    return localStorage.getItem(LEAD_FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Captura de contactos, un solo camino para toda la app: guarda en Supabase,
 * sincroniza al CRM, manda a Kajabi (etiquetas tunahual + nahual-<slug>), a
 * Zapier si está configurado, envía el email de la lectura y recuerda en este
 * navegador que la persona ya dejó sus datos (abre la Cruz Maya).
 */
export function useLeadCapture() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadSubmitted, setLeadSubmittedState] = useState(leerBandera);
  const [emailSent, setEmailSent] = useState(false);

  const marcarEnviado = useCallback(() => {
    setLeadSubmittedState(true);
    try {
      localStorage.setItem(LEAD_FLAG_KEY, "1");
    } catch {
      /* navegación privada: no pasa nada, solo no se recuerda */
    }
  }, []);

  const submit = useCallback(
    async (d: DatosLead): Promise<boolean> => {
      setIsSubmitting(true);
      try {
        const kinCompleto = d.tono ? `${d.tono} ${d.nahual.nombre}` : d.nahual.nombre;

        // El lead se guarda primero; si el correo ya existe (23505) seguimos: ya estaba registrado.
        const { error } = await supabase.from("leads").insert({
          nombre: d.nombre,
          email: d.email,
          telefono: d.telefono,
          fecha_nacimiento: d.fechaNacimiento,
          nahual: d.nahual.nombre,
          tono: d.tono,
          kin_completo: kinCompleto,
        });
        if (error && error.code !== "23505") throw error;

        // CRM (no bloqueante). Un synced:false queda en logs del servidor y en Sentry si está activo.
        fetch("/api/sync-lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: d.nombre,
            email: d.email,
            telefono: d.telefono,
            nahual: d.nahual.nombre,
            tono: d.tono,
            kin_completo: kinCompleto,
            fecha_nacimiento: d.fechaNacimiento,
          }),
        })
          .then(async (resp) => {
            const json = await resp.json().catch(() => null);
            if (json?.synced === false) {
              console.error("[sync-lead] el CRM no confirmó el lead:", json.crmError);
              import("@/lib/monitoring")
                .then(({ isSentryActive }) => {
                  if (isSentryActive()) {
                    import("@sentry/react").then((Sentry) => {
                      Sentry.captureMessage("sync-lead: CRM no confirmó el lead", {
                        level: "error",
                        extra: { crmError: json.crmError, email: d.email, telefono: d.telefono },
                      });
                    });
                  }
                })
                .catch(() => {
                  /* no romper el flujo del lead si el reporte falla */
                });
            }
          })
          .catch(console.error);

        // Kajabi (no bloqueante). Sin KAJABI_WEBHOOK_URL el endpoint responde ok:false.
        fetch("/api/kajabi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: d.nombre,
            email: d.email,
            telefono: d.telefono,
            nahualSlug: nahualToSlug[d.nahual.nombre],
            tono: d.tono,
            fecha_nacimiento: d.fechaNacimiento,
          }),
        }).catch(console.error);

        // Zapier si hay webhook configurado (no bloqueante).
        supabase
          .from("configuracion")
          .select("valor")
          .eq("clave", "zapier_webhook_url")
          .maybeSingle()
          .then(({ data: config }) => {
            if (config?.valor) {
              fetch(config.valor, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                mode: "no-cors",
                body: JSON.stringify({
                  nombre: d.nombre,
                  email: d.email,
                  telefono: d.telefono,
                  fecha_nacimiento: d.fechaNacimiento,
                  nahual: d.nahual.nombre,
                  tono: d.tono,
                  kin_completo: kinCompleto,
                  origen: d.origen ?? "home",
                  timestamp: new Date().toISOString(),
                }),
              }).catch(console.error);
            }
          });

        // Email de la lectura: se espera la respuesta para no afirmar un envío que no ocurrió.
        let sent = false;
        try {
          const resp = await fetch("/api/send-reading", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nombre: d.nombre,
              email: d.email,
              nahual: d.nahual.nombre,
              tono: d.tono,
              significado: d.nahual.significado,
              descripcion: d.nahual.descripcion,
              kin_completo: kinCompleto,
            }),
          });
          const json = await resp.json().catch(() => ({}));
          sent = json?.ok === true;
        } catch (e) {
          console.error("send-reading error:", e);
        }

        setEmailSent(sent);
        marcarEnviado();
        trackEvent("lead_enviado", { nahual: d.nahual.nombre, tono: d.tono, origen: d.origen ?? "home" });
        toast(
          sent
            ? { title: "¡Listo!", description: "Te enviamos tu lectura a tu correo." }
            : { title: "¡Guardado!", description: "Tu lectura quedó guardada." }
        );
        return true;
      } catch (error) {
        console.error("Error saving lead:", error);
        toast({
          title: "Error",
          description: "No se pudieron guardar tus datos. Intenta de nuevo.",
          variant: "destructive",
        });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [toast, marcarEnviado]
  );

  return { submit, isSubmitting, leadSubmitted, emailSent };
}
