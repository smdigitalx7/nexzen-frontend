import React, { useEffect, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import ProductionErrorBoundary from './ProductionErrorBoundary';
import { config, configUtils } from '@/lib/config/production';
import { productionUtils } from '@/lib/utils/production-optimizations';

// Loading component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-sm text-muted-foreground">Loading application...</p>
    </div>
  </div>
);

// Error fallback component
const ErrorFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <div className="text-center max-w-md">
      <h1 className="text-2xl font-bold text-destructive mb-4">Application Error</h1>
      <p className="text-muted-foreground mb-6">
        Something went wrong while loading the application. Please try refreshing the page.
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
      console.log('Performance monitoring enabled');
    }

    // Setup analytics
    if (config.monitoring.enableAnalytics) {
      // Initialize analytics
      console.log('Analytics enabled');
    }

    // Setup service worker
    if (config.features.enableServiceWorker) {
      // Register service worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('Service Worker registered:', registration);
          })
          .catch(error => {
            console.error('Service Worker registration failed:', error);
          });
      }
    }

    // Setup resource hints
    if (config.optimization.enablePreloading) {
      const criticalResources = [
        '/fonts/inter.woff2',
        '/css/critical.css',
      ];
      productionUtils.bundle.addResourceHints(criticalResources);
    }

    // Memory monitoring
    if (config.monitoring.enablePerformanceMonitoring) {
      const checkMemory = () => {
        const memory = productionUtils.performance.getMemoryUsage();
        if (memory && memory.used > config.performance.memoryWarningThreshold) {
          console.warn('High memory usage detected:', memory);
        }
      };

      const interval = setInterval(checkMemory, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, []);

  // Create QueryClient with production optimizations
  const queryClient = React.useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: config.api.cacheStaleTime,
        cacheTime: config.api.defaultCacheTTL,
        retry: config.api.retryAttempts,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: config.error.maxRetries,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  }), []);

  return (
    <ProductionErrorBoundary
      fallback={<ErrorFallback />}
      onError={(error, errorInfo) => {
        // Log error for debugging
        console.error('Production Error Boundary caught error:', error, errorInfo);
        
        // Report error if enabled
        if (config.error.enableErrorReporting) {
          productionUtils.error.reportError(error, {
            componentStack: errorInfo.componentStack,
            errorBoundary: 'ProductionApp',
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
    return productionUtils.performance.withPerformanceMonitoring(
      OptimizedComponent,
      Component.displayName || Component.name
    );
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
