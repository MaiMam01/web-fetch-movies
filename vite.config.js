import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 600,
    // Use esbuild minifier (default) — fast and produces output competitive
    // with terser for our hand-tuned code.
    minify: "esbuild",
    // Inline assets ≤ 4kB as base64 so they don't need an extra request.
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        // Split heavy vendor libs into long-lived cacheable chunks so the
        // app bundle stays small and updates don't bust the framework cache.
        // GSAP is dynamic-imported throughout the app — pinning it to its
        // own chunk lets the browser cache it permanently across deploys.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("react-router")) return "router";
          if (id.includes("/gsap/")) return "gsap";
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/scheduler/")
          ) {
            return "react";
          }
          return "vendor";
        },
      },
    },
  },
  // Trim dev-only artifacts from the production build. We keep `console.warn`
  // and `console.error` so genuine failures still surface in devtools, but
  // anything noisy (log/debug/info) and stray `debugger` statements are
  // stripped to shave bytes.
  esbuild: {
    legalComments: "none",
    drop: ["debugger"],
    pure: ["console.log", "console.debug", "console.info"],
  },
});
