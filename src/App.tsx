import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Suspense, lazy, useEffect } from "react";
import { RoutesSuspenseFallback } from "./components/RoutesSuspenseFallback";
import { trackPageview } from "./lib/analytics";

// Registra cada cambio de ruta como pageview (SPA: el load inicial no basta)
function RouteTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageview(location.pathname + location.search);
  }, [location.pathname, location.search]);
  return null;
}

// Eager: Home (crítico para LCP, ya hace lazy-load de sus propios modales)
import Index from "./pages/Index";

// Lazy: el resto de páginas
const Admin = lazy(() => import("./pages/Admin"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const NahualPage = lazy(() => import("./pages/NahualPage"));
const NahualesIndex = lazy(() => import("./pages/NahualesIndex"));
const ResultadoPage = lazy(() => import("./pages/ResultadoPage"));
const KinIndex = lazy(() => import("./pages/KinIndex"));
const KinPage = lazy(() => import("./pages/KinPage"));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RouteTracker />
            <Suspense fallback={<RoutesSuspenseFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/nahuales" element={<NahualesIndex />} />
                <Route path="/nahual/:slug" element={<NahualPage />} />
                <Route path="/resultado/:kinSlug" element={<ResultadoPage />} />
                <Route path="/kin" element={<KinIndex />} />
                <Route path="/kin/:kinSlug" element={<KinPage />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/reset-password" element={<ResetPassword />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
