import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from "vite-plugin-compression";

export default defineConfig(({ mode }) => {
  // Build date in format v1.1.DDMM (version 1.1, day.month concatenated)
  const date = new Date();
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const buildDate = `v1.1.${day}${month}`;

  return {
    // Base public path when served in production
    // Set VITE_BASE_PATH environment variable if deploying to a subdirectory
    // e.g., VITE_BASE_PATH=/app/ for deployment at https://example.com/app/
    // Defaults to '/' for root deployment
    base: process.env.VITE_BASE_PATH || "/",

    define: {
      __BUILD_DATE__: JSON.stringify(buildDate),
    },

    plugins: [
      react({
        babel: {
          plugins: [
            ...(process.env.NODE_ENV === "production"
              ? [["transform-remove-console", { exclude: ["error", "warn"] }]]
              : []),
          ],
        },
      }),
      viteCompression({ algorithm: "brotliCompress", ext: ".br" }),
      ...(process.env.ANALYZE === "true"
        ? [
            visualizer({
              filename: "dist/bundle-analysis.html",
              open: true,
              gzipSize: true,
              brotliSize: true,
            }),
          ]
        : []),
    ],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
      },
      // Ensure React is deduplicated across all chunks
      dedupe: ["react", "react-dom"],
    },

    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "scheduler",
        "zustand",
        "@tanstack/react-query",
        "@tanstack/react-table",
        "framer-motion",
        "lucide-react",
        "clsx",
        "tailwind-merge",
        "date-fns",
      ],
    },

    css: {
      devSourcemap: process.env.NODE_ENV === "development",
    },

    root: path.resolve(__dirname, "client"),

    build: {
      outDir: path.resolve(__dirname, "dist"),
      emptyOutDir: true,
      target: "es2020",
      minify: "terser",
      sourcemap: process.env.NODE_ENV === "development",
      chunkSizeWarningLimit: 1000,
      assetsInlineLimit: 4096,

      rollupOptions: {
        output: {
          entryFileNames: "js/[name]-[hash].js",
          chunkFileNames: "js/[name]-[hash].js",
          assetFileNames: (assetInfo) => {
            const ext = assetInfo.name?.split(".").pop() ?? "";
            if (/\.(css)$/.test(assetInfo.name ?? "")) {
              return `css/[name]-[hash].${ext}`;
            }
            return `assets/[name]-[hash].${ext}`;
          },
          manualChunks: (id) => {
            if (id.includes("node_modules")) {
              // 1. React Core (Must be a single instance)
              if (
                id.includes("node_modules/react/") ||
                id.includes("node_modules/react-dom/") ||
                id.includes("node_modules/scheduler/")
              ) {
                return "vendor-react-core";
              }

              // 2. State Management
              if (id.includes("node_modules/zustand/")) {
                return "vendor-state";
              }

              // 3. Data Fetching
              if (id.includes("node_modules/@tanstack/react-query/")) {
                return "vendor-query";
              }

              // 4. UI Framework & Animations (Heavy UI deps)
              if (
                id.includes("node_modules/@radix-ui/") ||
                id.includes("node_modules/framer-motion/") ||
                id.includes("node_modules/lucide-react/") ||
                id.includes("node_modules/clsx/") ||
                id.includes("node_modules/tailwind-merge/")
              ) {
                return "vendor-ui";
              }

              // 5. Heavy Utilities (Separated to avoid blocking main content)
              if (
                id.includes("node_modules/exceljs/") ||
                id.includes("node_modules/jspdf/") ||
                id.includes("node_modules/date-fns/")
              ) {
                return "vendor-utils";
              }

              // 6. Navigation
              if (
                id.includes("node_modules/react-router/") ||
                id.includes("node_modules/react-router-dom/") ||
                id.includes("node_modules/@remix-run/router/")
              ) {
                return "vendor-router";
              }

              // 7. Charts (Loaded only on pages that need them)
              if (id.includes("node_modules/recharts/")) {
                return "vendor-charts";
              }

              // Default for other smaller libs
              return "vendor-libs";
            }
          },
        },
        preserveEntrySignatures: "exports-only",
      },

      // Reduce preload requests: only preload critical chunks; others load on demand
      modulePreload: {
        polyfill: false,
      },

      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === "production",
          drop_debugger: true,
          pure_funcs:
            process.env.NODE_ENV === "production"
              ? ["console.log", "console.info"]
              : [],
        },
        mangle: { safari10: true },
        format: { comments: false },
      },
    },

    // Explicitly set envDir to project root (not client folder)
    // Vite's root is set to "client" folder (line 73), but we want .env files from project root
    // So we explicitly tell Vite where to find .env.production file
    // This ensures .env.production is read from project root during build
    envDir: path.resolve(__dirname),
    envPrefix: "VITE_",

    server: {
      port: 7000,
      fs: { strict: true, deny: ["/.*"] },
      proxy: {
        "/api": {
          target:
            process.env.VITE_API_PROXY_TARGET || "https://erpapi.velonex.in",
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path,
        },
      },
    },
  };
});
