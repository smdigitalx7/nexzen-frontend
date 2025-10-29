import React, { useEffect, Suspense } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import ProductionErrorBoundary from "./ProductionErrorBoundary";
import { config, configUtils } from "@/lib/config/production";
import { productionUtils } from "@/lib/utils/production-optimizations";
import { LoadingStates } from "@/components/ui/loading";

// Loading component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center space-y-4">
      {/* Simple circle spinner */}
      <div className="relative">
        <div className="w-12 h-12 border-4 border-primary/20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>

      {/* Message */}
      <p className="text-sm font-medium text-muted-foreground">
        Loading application...
      </p>
    </div>
  </div>
);

// Error fallback component
const ErrorFallback = ({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) => (
  <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <div className="text-center max-w-md">
      <h1 className="text-2xl font-bold text-destructive mb-4">
        Application Error
      </h1>
      <p className="text-muted-foreground mb-6">
        Something went wrong while loading the application. Please try
        refreshing the page.
      </p>
      <div className="space-x-4">
        <button
          onClick={resetError}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 border border-border rounded-md hover:bg-muted"
        >
          Refresh Page
        </button>
      </div>
    </div>
  </div>
);

// Production App wrapper component
interface ProductionAppProps {
  children: React.ReactNode;
}

export const ProductionApp: React.FC<ProductionAppProps> = ({ children }) => {
  // Initialize production utilities
  useEffect(() => {
    // Setup global error handling
    if (config.error.enableErrorReporting) {
      productionUtils.error.setupGlobalErrorHandling();
    }

    // Setup performance monitoring
    if (config.monitoring.enablePerformanceMonitoring) {
      // Initialize performance monitoring
      console.log("Performance monitoring enabled");
    }

    // Setup analytics
    if (config.monitoring.enableAnalytics) {
      // Initialize analytics
      console.log("Analytics enabled");
    }

    // Setup service worker
    if (config.features.enableServiceWorker) {
      // Register service worker
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registered:", registration);
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error);
          });
      }
    }

    // Setup resource hints - only preload resources that actually exist
    if (config.optimization.enableImageOptimization) {
      // Only preload resources that actually exist in the project
      const criticalResources: string[] = [
        // Add actual resources here when they exist
        // '/css/critical.css', // Uncomment when you create this file
        // '/fonts/inter.woff2', // Uncomment when you add local fonts
      ];

      // Only add hints if there are resources to preload
      if (criticalResources.length > 0) {
        productionUtils.bundle.addResourceHints(criticalResources);
      }
    }

    // Memory monitoring
    if (config.monitoring.enablePerformanceMonitoring) {
      const checkMemory = () => {
        const memory = productionUtils.performance.getMemoryUsage();
        if (memory && memory.used > config.performance.memoryWarningThreshold) {
          console.warn("High memory usage detected:", memory);
        }
      };

      const interval = setInterval(checkMemory, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <ProductionErrorBoundary
      onError={(error, errorInfo) => {
        // Log error for debugging
        console.error(
          "Production Error Boundary caught error:",
          error,
          errorInfo
        );

        // Report error if enabled
        if (config.error.enableErrorReporting) {
          productionUtils.error.reportError(error, {
            componentStack: errorInfo.componentStack,
            errorBoundary: "ProductionApp",
          });
        }
      }}
      showDetails={config.error.showErrorDetails}
      enableRetry={true}
      enableReport={config.error.enableErrorReporting}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Suspense fallback={<LoadingFallback />}>
            <div className="min-h-screen bg-background text-foreground">
              {children}
            </div>
            <Toaster />
          </Suspense>
        </TooltipProvider>
      </QueryClientProvider>
    </ProductionErrorBoundary>
  );
};

// HOC for wrapping components with production optimizations
export const withProductionOptimizations = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const OptimizedComponent = React.memo(Component);

  // Add performance monitoring if enabled
  if (config.monitoring.enablePerformanceMonitoring) {
    // Wrap component with performance monitoring
    const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
      const startTime = performance.now();
      const result = React.createElement(OptimizedComponent, { ...props, ref });
      productionUtils.performance.measureRender(
        Component.displayName || Component.name,
        startTime
      );
      return result;
    });
    WrappedComponent.displayName = `withPerformanceMonitoring(${
      Component.displayName || Component.name
    })`;
    return WrappedComponent;
  }

  return OptimizedComponent;
};

// Hook for production utilities
export const useProductionUtils = () => {
  const [memoryUsage, setMemoryUsage] = React.useState<{
    used: number;
    total: number;
    limit: number;
  } | null>(null);

  useEffect(() => {
    if (config.monitoring.enablePerformanceMonitoring) {
      const updateMemoryUsage = () => {
        const usage = productionUtils.performance.getMemoryUsage();
        if (usage) {
          setMemoryUsage(usage);
        }
      };

      updateMemoryUsage();
      const interval = setInterval(updateMemoryUsage, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const measurePerformance = React.useCallback(
    (name: string, operation: () => void) => {
      const startTime = performance.now();
      operation();
      productionUtils.performance.measureRender(name, startTime);
    },
    []
  );

  const reportError = React.useCallback(
    (error: Error, context?: Record<string, any>) => {
      productionUtils.error.reportError(error, context);
    },
    []
  );

  return {
    memoryUsage,
    measurePerformance,
    reportError,
    config: configUtils,
  };
};

export default ProductionApp;
