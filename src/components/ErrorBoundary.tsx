import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Evita la pantalla blanca: si cualquier componente lanza una excepción al
 * renderizar, mostramos un mensaje sobrio en la paleta de la marca en lugar
 * de desmontar toda la app.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary capturó un error:", error, info);

    // Reportar a Sentry solo si está activo (import dinámico, sin dependencia dura)
    import("../lib/monitoring")
      .then(({ isSentryActive }) => {
        if (isSentryActive()) {
          import("@sentry/react").then((Sentry) => {
            Sentry.captureException(error, {
              contexts: { react: { componentStack: info.componentStack } },
            });
          });
        }
      })
      .catch(() => {
        /* no romper el fallback si el reporte falla */
      });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-background px-6 text-center">
          <div className="max-w-sm space-y-4">
            <p className="text-[0.7rem] uppercase tracking-[0.25em] text-primary/70 font-medium">
              Cholq'ij
            </p>
            <h1 className="font-serif text-3xl font-semibold text-foreground">
              Algo se interpuso en el camino
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tuvimos un inconveniente al mostrar esta página. Vuelve a
              intentarlo en un momento.
            </p>
            <button
              onClick={() => window.location.assign("/")}
              className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium py-3 px-6 transition-all hover:bg-primary/90"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
