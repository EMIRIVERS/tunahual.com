import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// Sube sourcemaps a Sentry SOLO si hay token en build (deja stacktraces
// legibles). Sin token, no se generan ni publican sourcemaps.
const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    SENTRY_AUTH_TOKEN &&
      sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: SENTRY_AUTH_TOKEN,
        sourcemaps: { filesToDeleteAfterUpload: ["./dist/**/*.map"] },
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: SENTRY_AUTH_TOKEN ? true : false,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-core": ["react", "react-dom", "react-router-dom", "react-helmet-async"],
          "vendor-animation": ["framer-motion"],
          "vendor-charts": ["recharts"],
          "vendor-db": ["@supabase/supabase-js"],
          "vendor-data": ["@tanstack/react-query", "react-hook-form", "@hookform/resolvers", "zod"],
        },
      },
    },
  },
}));
