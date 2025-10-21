import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react({
      // Optimize React for production
      babel: {
        plugins: [
          ...(process.env.NODE_ENV === "production"
            ? [["transform-remove-console", { exclude: ["error", "warn"] }]]
            : []),
        ],
      },
    }),

    // Optional: Visualize bundle when ANALYZE=true
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

  // Resolve @ alias to client/src
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
    },
  },

  // Dependency optimization for faster dev
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
  },

  css: {
    devSourcemap: process.env.NODE_ENV === "development",
  },

  // Project root and output directories
  root: path.resolve(__dirname, "client"),

  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    target: "esnext",
    minify: "terser",
    sourcemap: process.env.NODE_ENV === "development",
    chunkSizeWarningLimit: 1000,

    // ✅ Automatic chunking (no manual chunk config)
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
      },
      preserveEntrySignatures: "strict",
    },

    // ✅ Preload dependencies safely
    modulePreload: { polyfill: true },

    // ✅ Terser cleanup for production
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

  // Dev server setup (local development)
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
          proxy.on("error", (err) => {
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
});
