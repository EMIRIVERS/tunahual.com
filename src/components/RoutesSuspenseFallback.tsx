import { Loader2 } from "lucide-react";

/**
 * Minimal fallback for Suspense while lazy routes load.
 * Lightweight: shows a spinner in the brand palette.
 */
export const RoutesSuspenseFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
      <p className="mt-2 text-sm text-muted-foreground">Cargando...</p>
    </div>
  </div>
);
