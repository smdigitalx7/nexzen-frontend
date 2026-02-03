import React, { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/core/query";
import { TooltipProvider } from "@/common/components/ui/tooltip";
import { Toaster } from "@/common/components/ui/toaster";
import ProductionErrorBoundary from "./ProductionErrorBoundary";
// Temporarily comment out config imports - will be re-added when config is properly set up
// import { config, configUtils } from "@/core/config/production";
// Mock config for now
const config = {
  monitoring: { enablePerformanceMonitoring: false, enableAnalytics: false },
  features: { enableServiceWorker: false },
  optimization: { enableImageOptimization: false },
  error: { enableErrorReporting: false, showErrorDetails: true },
  performance: { memoryWarningThreshold: 1024 * 1024 * 1024 },
};
const configUtils = {};
import { productionUtils } from "@/common/utils/performance/production-optimizations";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { useAuthStore } from "@/core/auth/authStore";

// Loading and error fallbacks are handled by ProductionErrorBoundary

// Production App wrapper component
interface ProductionAppProps {
  children: React.ReactNode;
}

export const ProductionApp: React.FC<ProductionAppProps> = ({ children }) => {
  // ✅ PERF: Selector prevents whole app rerender on unrelated auth state changes
  const isBranchSwitching = useAuthStore((s) => s.isBranchSwitching);
  const [isAcademicYearSwitching, setIsAcademicYearSwitching] = useState(false);

  // MutationObserver and body overflow safety mechanism removed - caused infinite loops
  // Accessibilty fixes should be handled by Radix primitives or targeted fixes, not global observers

  // Listen for academic year switch events
  useEffect(() => {
    const handleAcademicYearSwitch = () => {
      setIsAcademicYearSwitching(true);
      // Reset after a short delay to allow queries to refetch
      setTimeout(() => {
        setIsAcademicYearSwitching(false);
      }, 500);
    };

    globalThis.addEventListener("academic-year-switched", handleAcademicYearSwitch);
    return () => {
      globalThis.removeEventListener(
        "academic-year-switched",
        handleAcademicYearSwitch
      );
    };
  }, []);

  // Initialize production utilities
  useEffect(() => {
    // Setup global error handling (always enabled for better error tracking)
    productionUtils.error.setupGlobalErrorHandling();

    // Setup performance monitoring
    if (config.monitoring.enablePerformanceMonitoring) {
      // Initialize performance monitoring
      // Performance monitoring enabled
    }

    // Setup analytics
    if (config.monitoring.enableAnalytics) {
      // Initialize analytics
      // Analytics enabled
    }

    // Setup service worker
    if (config.features.enableServiceWorker) {
      // Register service worker
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/sw.js")
          .then(() => {
            // Service Worker registered successfully
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
    const WrappedComponent = React.forwardRef<HTMLElement, P>((props, ref) => {
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
    (error: Error, context?: Record<string, unknown>) => {
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
