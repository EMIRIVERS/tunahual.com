import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initMonitoring } from "./lib/monitoring";
import { initAnalytics } from "./lib/analytics";

// Monitoreo de errores (Sentry) si hay VITE_SENTRY_DSN configurado
initMonitoring();

// Analítica (GA4 + Meta Pixel) si hay IDs configurados
initAnalytics();

createRoot(document.getElementById("root")!).render(<App />);
