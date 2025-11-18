import React, { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import ProductionErrorBoundary from "./ProductionErrorBoundary";
import { config, configUtils } from "@/lib/config/production";
import { productionUtils } from "@/lib/utils/performance/production-optimizations";
import { Loader } from "@/components/ui/ProfessionalLoader";
import { useAuthStore } from "@/store/authStore";

// ✅ FIX: Use professional loader for consistent UX
const LoadingFallback = () => <Loader.Page message="Loading application..." />;

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
  const { isBranchSwitching } = useAuthStore();
  const [isAcademicYearSwitching, setIsAcademicYearSwitching] = useState(false);

  // Listen for academic year switch events
  useEffect(() => {
    const handleAcademicYearSwitch = () => {
      setIsAcademicYearSwitching(true);
      // Reset after a short delay to allow queries to refetch
      setTimeout(() => {
        setIsAcademicYearSwitching(false);
      }, 500);
    };

    window.addEventListener('academic-year-switched', handleAcademicYearSwitch);
    return () => {
      window.removeEventListener('academic-year-switched', handleAcademicYearSwitch);
    };
  }, []);

  // Initialize production utilities
  useEffect(() => {
    // Setup global error handling (always enabled for better error tracking)
    productionUtils.error.setupGlobalErrorHandling();

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
          <div className="min-h-screen bg-background text-foreground relative">
            {/* Global loading overlay during branch/academic year switch */}
            {(isBranchSwitching || isAcademicYearSwitching) && (
              <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Loader.Page 
                    message={
                      isBranchSwitching 
                        ? "Switching branch and refreshing data..." 
                        : "Switching academic year and refreshing data..."
                    } 
                  />
                </div>
              </div>
            )}
            {children}
          </div>
          <Toaster />
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
