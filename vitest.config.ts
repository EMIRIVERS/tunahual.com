import { defineConfig } from "vitest/config";

/**
 * Unit tests (Vitest). Los E2E de Playwright viven en /e2e y corren aparte
 * con `bun run test:e2e` — no deben mezclarse con esta suite.
 */
export default defineConfig({
  test: {
    include: ["api/**/*.test.ts", "src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: ["e2e/**", "node_modules/**"],
    environment: "node",
  },
});
