import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(async () => {
  const cartographer =
    process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
      ? (await import("@replit/vite-plugin-cartographer")).cartographer()
      : null;

  return {
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
      runtimeErrorOverlay(),
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
      ...(cartographer ? [cartographer] : []),
    ],

    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
      },
    },

    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "scheduler",
        "wouter",
        "zustand",
        "@tanstack/react-query",
        "@tanstack/react-table",
        "framer-motion",
        "lucide-react",
        "clsx",
        "tailwind-merge",
        "date-fns",
      ],
      exclude: ["@replit/vite-plugin-cartographer"],
    },

    css: {
      devSourcemap: process.env.NODE_ENV === "development",
    },

    root: path.resolve(import.meta.dirname, "client"),

    build: {
      outDir: path.resolve(import.meta.dirname, "dist"),
      emptyOutDir: true,
      target: "esnext",
      minify: "terser",
      sourcemap: process.env.NODE_ENV === "development",
      chunkSizeWarningLimit: 1000,

      // ✅ Simplified chunk splitting for stability
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Group heavy libraries together for cache efficiency
            if (id.includes("node_modules")) {
              // Keep React + related UI libs together to prevent "undefined React"
              if (
                id.includes("react") ||
                id.includes("framer-motion") ||
                id.includes("lucide-react") ||
                id.includes("zustand") ||
                id.includes("@tanstack")
              ) {
                return "react-vendor";
              }

              // Common utility libraries
              if (
                id.includes("clsx") ||
                id.includes("tailwind-merge") ||
                id.includes("date-fns") ||
                id.includes("immer") ||
                id.includes("zod")
              ) {
                return "utils-vendor";
              }
            }

            // Feature-based chunking
            if (
              id.includes("components/pages/school") ||
              id.includes("components/features/school")
            )
              return "school-components";

            if (
              id.includes("components/pages/college") ||
              id.includes("components/features/college")
            )
              return "college-components";

            if (
              id.includes("components/pages/general") ||
              id.includes("components/features/general")
            )
              return "general-components";

            // ✅ Shared/UI/Layout should depend on React chunk directly
            if (
              id.includes("components/shared") ||
              id.includes("components/ui") ||
              id.includes("components/layout")
            )
              return "react-vendor";

            if (id.includes("lib/") || id.includes("store/"))
              return "lib-utils";
          },

          chunkFileNames: (chunkInfo) => {
            if (chunkInfo.name === "react-vendor") {
              return "js/0-react-vendor-[hash].js";
            }
            return "js/[name]-[hash].js";
          },

          entryFileNames: "js/[name]-[hash].js",
          assetFileNames: (assetInfo) => {
            const ext = assetInfo.name?.split(".").pop() ?? "";
            if (/\.(css)$/.test(assetInfo.name ?? "")) {
              return `css/[name]-[hash].${ext}`;
            }
            return `assets/[name]-[hash].${ext}`;
          },
        },
        preserveEntrySignatures: "strict",
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

      // ✅ Ensure React preload is injected automatically
      modulePreload: { polyfill: true },
    },

    server: {
      port: 7000,
      fs: { strict: true, deny: ["**/.*"] },
      proxy: {
        "/api": {
          target: "https://erpapi.velonex.in",
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path,
          configure: (proxy) => {
            proxy.on("error", (err, req, res) => {
              console.log("❌ Proxy error:", err);
            });
            proxy.on("proxyReq", (proxyReq, req) => {
              console.log("🔄 Proxying request:", req.method, req.url);
            });
            proxy.on("proxyRes", (proxyRes, req) => {
              console.log("✅ Proxy response:", proxyRes.statusCode, req.url);
              proxyRes.headers["Access-Control-Allow-Origin"] = "*";
              proxyRes.headers["Access-Control-Allow-Methods"] =
                "GET, POST, PUT, DELETE, OPTIONS";
              proxyRes.headers["Access-Control-Allow-Headers"] =
                "Content-Type, Authorization";
              proxyRes.headers["Access-Control-Allow-Credentials"] = "true";
            });
          },
        },
      },
    },
  };
});
