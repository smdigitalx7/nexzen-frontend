import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from "vite-plugin-compression";

export default defineConfig({
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
        manualChunks: (id) => {
          // Split large vendor libraries into separate chunks
          if (id.includes("node_modules")) {
            // React core - ensure react, react-dom, and scheduler are in the same chunk
            // This prevents initialization issues when React is split
            // Match exact React packages, not packages that contain "react" in their name
            if (
              id.includes("node_modules/react/") || 
              id.includes("node_modules/react-dom/") || 
              id.includes("node_modules/scheduler/") ||
              id.includes("node_modules\\react\\") || 
              id.includes("node_modules\\react-dom\\") || 
              id.includes("node_modules\\scheduler\\") ||
              // Also match if it's exactly react or react-dom (for edge cases)
              /[\/\\]react$/.test(id) ||
              /[\/\\]react-dom$/.test(id) ||
              /[\/\\]scheduler$/.test(id)
            ) {
              // Skip if it's a React-related package but not core React
              if (
                id.includes("react-hook-form") ||
                id.includes("react-day-picker") ||
                id.includes("react-icons") ||
                id.includes("react-resizable") ||
                id.includes("react-query") ||
                id.includes("react-table") ||
                id.includes("react-virtual")
              ) {
                // Let these fall through to their respective chunks
              } else {
                return "vendor-react";
              }
            }
            
            // Router
            if (id.includes("wouter")) {
              return "vendor-router";
            }
            
            // State management
            if (id.includes("zustand") || id.includes("@tanstack/react-query") || id.includes("@tanstack/react-table")) {
              return "vendor-state";
            }
            
            // UI libraries
            if (id.includes("lucide-react") || id.includes("framer-motion") || id.includes("clsx") || id.includes("tailwind-merge")) {
              return "vendor-ui";
            }
            
            // Radix UI components (large library)
            if (id.includes("@radix-ui")) {
              return "vendor-radix";
            }
            
            // Large charting library - split separately
            if (id.includes("recharts")) {
              return "vendor-charts";
            }
            
            // PDF and export libraries - split separately
            if (id.includes("jspdf") || id.includes("html2canvas") || id.includes("exceljs")) {
              return "vendor-export";
            }
            
            // Form libraries
            if (id.includes("react-hook-form") || id.includes("@hookform") || id.includes("zod")) {
              return "vendor-forms";
            }
            
            // Date libraries
            if (id.includes("date-fns") || id.includes("react-day-picker")) {
              return "vendor-dates";
            }
            
            // Other vendor code
            return "vendor";
          }
        },
        entryFileNames: "js/[name]-[hash].js",
        chunkFileNames: (chunkInfo) => {
          // Ensure React chunk has a consistent name for proper loading order
          if (chunkInfo.name === "vendor-react") {
            return "js/vendor-react-[hash].js";
          }
          return "js/[name]-[hash].js";
        },
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

    modulePreload: { polyfill: true },

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
});
