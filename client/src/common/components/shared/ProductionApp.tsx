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
  const { isBranchSwitching } = useAuthStore();
  const [isAcademicYearSwitching, setIsAcademicYearSwitching] = useState(false);

  // ✅ CRITICAL FIX: Global MutationObserver to fix aria-hidden violations
  // Radix UI sets aria-hidden on elements that contain focused descendants, which violates accessibility
  useEffect(() => {
    const fixAriaHiddenViolations = () => {
      // Find all elements with aria-hidden="true"
      const allElements = document.querySelectorAll('[aria-hidden="true"]');
      const activeElement = document.activeElement;

      allElements.forEach((el) => {
        // If this element or any of its ancestors contains the active element, remove aria-hidden
        if (el.contains(activeElement)) {
          el.removeAttribute("aria-hidden");
        }
      });
    };

    // ✅ CRITICAL: MutationObserver to watch for aria-hidden being set incorrectly
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "aria-hidden"
        ) {
          const target = mutation.target as Element;
          if (target.getAttribute("aria-hidden") === "true") {
            // Check if this element contains the active element
            if (target.contains(document.activeElement)) {
              // Remove aria-hidden immediately
              target.removeAttribute("aria-hidden");
            }
          }
        }

        // Also check for new nodes with aria-hidden
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.getAttribute("aria-hidden") === "true") {
                if (element.contains(document.activeElement)) {
                  element.removeAttribute("aria-hidden");
                }
              }
              // Check descendants
              const descendants = element.querySelectorAll(
                '[aria-hidden="true"]'
              );
              descendants.forEach((desc) => {
                if (desc.contains(document.activeElement)) {
                  desc.removeAttribute("aria-hidden");
                }
              });
            }
          });
        }
      });

      // Also run the fix function
      fixAriaHiddenViolations();
    });

    // Observe the entire document for aria-hidden changes
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["aria-hidden"],
      childList: true,
      subtree: true,
    });

    // ✅ CRITICAL FIX: Global body overflow safety mechanism
    // This ensures body overflow is always restored, preventing UI freezes
    let checkInterval: NodeJS.Timeout | null = null;

    const checkAndRestoreBodyOverflow = () => {
      // Check if body is locked but no dialogs are open
      const currentOverflow = document.body.style.overflow;

      // If body is locked (overflow: hidden), check if dialogs are actually open
      if (currentOverflow === "hidden") {
        // Check if there are any open dialogs/alerts
        const openDialogs = document.querySelectorAll(
          '[role="dialog"][data-state="open"]'
        );
        const openAlerts = document.querySelectorAll(
          '[role="alertdialog"][data-state="open"]'
        );

        // If no dialogs are open but body is locked, restore it
        if (openDialogs.length === 0 && openAlerts.length === 0) {
          document.body.style.overflow = "";
          document.body.style.pointerEvents = "";

          // ✅ CRITICAL: Also remove aria-hidden from root if no dialogs are open
          const root = document.getElementById("root");
          if (root && root.getAttribute("aria-hidden") === "true") {
            root.removeAttribute("aria-hidden");
          }
        }
      }

      // ✅ CRITICAL: Remove aria-hidden from elements that have focused descendants
      fixAriaHiddenViolations();
    };

    // Check every 100ms to catch stuck body overflow
    checkInterval = setInterval(checkAndRestoreBodyOverflow, 100);

    // Also check on visibility change (when user switches tabs/windows)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAndRestoreBodyOverflow();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // ✅ CRITICAL: Also check on focus changes
    const handleFocusChange = () => {
      fixAriaHiddenViolations();
    };
    document.addEventListener("focusin", handleFocusChange);
    document.addEventListener("focusout", handleFocusChange);

    // Cleanup
    return () => {
      observer.disconnect();
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("focusin", handleFocusChange);
      document.removeEventListener("focusout", handleFocusChange);
      // Final safety check on unmount
      const openDialogs = document.querySelectorAll(
        '[role="dialog"][data-state="open"]'
      );
      const openAlerts = document.querySelectorAll(
        '[role="alertdialog"][data-state="open"]'
      );
      if (openDialogs.length === 0 && openAlerts.length === 0) {
        document.body.style.overflow = "";
      }
      fixAriaHiddenViolations();
    };
  }, []);

  // Listen for academic year switch events
  useEffect(() => {
    const handleAcademicYearSwitch = () => {
      setIsAcademicYearSwitching(true);
      // Reset after a short delay to allow queries to refetch
      setTimeout(() => {
        setIsAcademicYearSwitching(false);
      }, 500);
    };

    window.addEventListener("academic-year-switched", handleAcademicYearSwitch);
    return () => {
      window.removeEventListener(
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
