/**
 * Error monitoring (Sentry), activado por variable de entorno VITE_SENTRY_DSN.
 * Si no hay DSN, es un no-op total y @sentry/react NUNCA se carga (import
 * dinámico) — cero peso en el bundle cuando está apagado.
 * Seguro en SSR y cliente.
 */

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

let isInitialized = false;
let active = false;

/**
 * Inicializa Sentry solo si hay DSN. Llamado una vez al arranque en main.tsx.
 */
export function initMonitoring(): void {
  if (typeof window === 'undefined' || isInitialized) {
    return;
  }
  isInitialized = true;

  if (!SENTRY_DSN) {
    return;
  }

  // Import dinámico: @sentry/react solo se descarga si hay DSN configurado.
  import('@sentry/react')
    .then((Sentry) => {
      Sentry.init({
        dsn: SENTRY_DSN,
        environment: import.meta.env.MODE,
        tracesSampleRate: 0.1,
      });
      active = true;
    })
    .catch((error) => {
      console.error('[Monitoring] Sentry initialization failed:', error);
    });
}

/**
 * Indica si Sentry está activo (hubo DSN y se inicializó correctamente).
 */
export function isSentryActive(): boolean {
  return active;
}
