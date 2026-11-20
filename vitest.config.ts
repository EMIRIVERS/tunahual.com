import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";

/**
 * Unit tests (Vitest). Los E2E de Playwright viven en /e2e y corren aparte
 * con `bun run test:e2e` — no deben mezclarse con esta suite.
 */
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["api/**/*.test.ts", "src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: ["e2e/**", "node_modules/**"],
    environment: "node",
  },
});
