import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react({
      // Optimize React for production
      babel: {
        plugins: [
          // Remove console.log in production
          ...(process.env.NODE_ENV === "production"
            ? [["transform-remove-console", { exclude: ["error", "warn"] }]]
            : []),
        ],
      },
    }),
    runtimeErrorOverlay(),
    // Bundle analyzer for development
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
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer()
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
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
      "exceljs",
      "jspdf",
    ],
    exclude: ["@replit/vite-plugin-cartographer"],
    // Force React to be pre-bundled and available
    force: true,
  },
  // CSS optimization
  css: {
    devSourcemap: process.env.NODE_ENV === "development",
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    // Optimize build settings
    target: "esnext",
    minify: "terser",
    sourcemap: process.env.NODE_ENV === "development",
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Ensure proper module resolution
    commonjsOptions: {
      include: [/node_modules/],
    },
    // Module preload for proper chunk loading
    modulePreload: {
      polyfill: true,
    },
    // Rollup options for advanced bundling
    rollupOptions: {
      output: {
        // Simplified chunk splitting to avoid React loading issues
        manualChunks: (id) => {
          // Put ALL node_modules in one vendor chunk to avoid loading order issues
          if (id.includes("node_modules")) {
            return "vendor";
          }

          // Feature-based chunks for application code only
          if (
            id.includes("components/pages/general") ||
            id.includes("components/features/general")
          ) {
            return "general-components";
          }
          if (
            id.includes("components/pages/school") ||
            id.includes("components/features/school")
          ) {
            return "school-components";
          }
          if (
            id.includes("components/pages/college") ||
            id.includes("components/features/college")
          ) {
            return "college-components";
          }
          if (
            id.includes("components/shared") ||
            id.includes("components/ui") ||
            id.includes("components/layout")
          ) {
            return "shared-components";
          }
          if (id.includes("lib/") || id.includes("store/")) {
            return "lib-utils";
          }
        },
        // Optimize chunk naming and ensure proper loading order
        chunkFileNames: (chunkInfo) => {
          // Vendor chunk loads first
          if (chunkInfo.name === "vendor") {
            return "js/0-vendor-[hash].js";
          }
          return `js/[name]-[hash].js`;
        },
        // Ensure proper chunk loading order
        entryFileNames: "js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return "assets/[name]-[hash].[ext]";
          const info = assetInfo.name.split(".");
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name)) {
            return `css/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
      // External dependencies (if using CDN)
      external: [],
      // Ensure React is not externalized and is bundled
      preserveEntrySignatures: "strict",
      // Ensure proper module resolution
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
    },
    // Terser options for better minification
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === "production",
        drop_debugger: true,
        pure_funcs:
          process.env.NODE_ENV === "production"
            ? ["console.log", "console.info"]
            : [],
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
  },
  server: {
    port: 7000,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: {
      "/api": {
        target: "https://erpapi.velonex.in",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => {
          // The external API expects /api/v1 paths, so we need to ensure they're preserved
          console.log("🔄 Proxy rewrite:", path);
          return path;
        },
        configure: (proxy, _options) => {
          proxy.on("error", (err, req, res) => {
            console.log("❌ Proxy error:", err);
            console.log("Request URL:", req.url);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            const targetUrl = `${proxyReq.protocol}//${proxyReq.getHeader(
              "host"
            )}${proxyReq.path}`;
            console.log(
              "🔄 Proxying request:",
              req.method,
              req.url,
              "→",
              targetUrl
            );
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log("✅ Proxy response:", proxyRes.statusCode, req.url);
            // Add CORS headers to the response
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
});
