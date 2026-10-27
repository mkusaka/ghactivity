import { cloudflare } from "@cloudflare/vite-plugin";
import { inertiaPages } from "@hono/inertia/vite";
import tailwindcss from "@tailwindcss/vite";
import { redact } from "@tanstack/redact/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin, type UserConfig } from "vite";
import ssrPlugin from "vite-ssr-components/plugin";

// Redact configures an `ssr` environment (via both `environments.ssr` and the top-level `ssr` shorthand),
// but the Cloudflare plugin builds the worker in its own environment, so the extra empty `ssr` environment
// fails the build. Both keys have to go; the worker bundles all deps anyway.
const [redactCore, ...redactRest] = redact();
const redactPlugins: Plugin[] = [
  {
    ...redactCore,
    config() {
      const config = (redactCore.config as () => UserConfig)();
      delete config.environments!.ssr;
      delete config.ssr;
      return config;
    },
  },
  ...redactRest,
];

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    inertiaPages({ pagesDir: "src/pages", outFile: "src/pages.gen.ts" }),
    cloudflare(),
    ssrPlugin(),
    react(),
    redactPlugins,
    tailwindcss(),
  ],
});
