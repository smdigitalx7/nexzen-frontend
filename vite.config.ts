import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from "vite-plugin-compression";

export default defineConfig(({ mode }) => {
  return {
    // Base public path when served in production
    // Set VITE_BASE_PATH environment variable if deploying to a subdirectory
    // e.g., VITE_BASE_PATH=/app/ for deployment at https://example.com/app/
    // Defaults to '/' for root deployment
    base: process.env.VITE_BASE_PATH || "/",

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

    root: path.resolve(__dirname, "client"),

    build: {
      outDir: path.resolve(__dirname, "dist"),
      emptyOutDir: true,
      target: "esnext",
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
          // Let Vite automatically handle code splitting based on dependencies
          // This ensures proper module loading order and avoids initialization issues
        },
        preserveEntrySignatures: false,
      },

      modulePreload: {
        polyfill: true,
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
          target: "https://erpapi.velonex.in",
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path,
        },
      },
    },
  };
});
