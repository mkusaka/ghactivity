import { defineConfig } from "vitest/config";

// Separate from vite.config.ts so the Cloudflare plugin doesn't start a worker runtime for unit tests
export default defineConfig({ resolve: { tsconfigPaths: true } });
