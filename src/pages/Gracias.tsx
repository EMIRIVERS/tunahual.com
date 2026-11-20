import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

/**
 * Página de agradecimiento tras el pago (success_url de Stripe). No consulta
 * el pago: el PDF lo dispara el webhook, no esta página. Tono editorial,
 * sin urgencia ni promesas que dependan de ella.
 */
const Gracias = () => {
  useEffect(() => {
    trackEvent("mapa_compra_redirigida");
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <Helmet>
        <title>{`Gracias · Tu Mapa de Energía`}</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="max-w-md text-center space-y-5">
        <p className="text-xs uppercase tracking-[0.3em] text-primary/80">Cholq'ij</p>
        <h1 className="font-serif text-4xl text-foreground">Gracias</h1>
        <p className="text-muted-foreground leading-relaxed">
          Recibimos tu pago. Tu Mapa de Energía llegará a tu correo en PDF en los próximos minutos. Si no lo ves, revisa tu carpeta de correo no deseado.
        </p>
        <p className="text-sm text-muted-foreground">tunahual.com · Azul Anaité</p>
        <Button asChild variant="outline" className="rounded-full px-8 py-6">
          <Link to="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
};

export default Gracias;
