import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import NahualPage from "./pages/NahualPage";
import NahualesIndex from "./pages/NahualesIndex";
import ResultadoPage from "./pages/ResultadoPage";
import KinIndex from "./pages/KinIndex";
import KinPage from "./pages/KinPage";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
  </ErrorBoundary>
);

export default App;
