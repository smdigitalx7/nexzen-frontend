import React, { memo, useMemo, useCallback, useEffect, useRef } from 'react';

/**
 * Production-ready optimization utilities
 * These utilities help optimize components for production use
 */

// Performance monitoring utilities
export const performanceUtils = {
  // Measure component render time
  measureRender: (componentName: string, startTime: number) => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (renderTime > 16) { // Longer than one frame
      console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }
    
    return renderTime;
  },

  // Measure async operations
  measureAsync: async <T>(name: string, operation: () => Promise<T>): Promise<T> => {
    const startTime = performance.now();
    try {
      const result = await operation();
      const endTime = performance.now();
      console.log(`${name} completed in ${(endTime - startTime).toFixed(2)}ms`);
      return result;
    } catch (error) {
      const endTime = performance.now();
      console.error(`${name} failed after ${(endTime - startTime).toFixed(2)}ms:`, error);
      throw error;
    }
  },

  // Memory usage monitoring
  getMemoryUsage: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
      };
    }
    return null;
  },
};

// HOC for performance monitoring
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  const WrappedComponent = memo((props: P) => {
    const startTime = useRef(performance.now());
    const name = componentName || Component.displayName || Component.name || 'Unknown';

    useEffect(() => {
      performanceUtils.measureRender(name, startTime.current);
    });

    return React.createElement(Component, props);
  });

  WrappedComponent.displayName = `withPerformanceMonitoring(${componentName || Component.displayName || Component.name})`;
  return WrappedComponent;
};

// HOC for error boundaries
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
) => {
  const ErrorBoundary = memo((props: P) => {
    const [error, setError] = React.useState<Error | null>(null);

    const resetError = useCallback(() => {
      setError(null);
    }, []);

    if (error) {
      if (fallback) {
        const FallbackComponent = fallback;
        return React.createElement(FallbackComponent, { error, resetError });
      }
      return React.createElement('div', { className: "flex items-center justify-center p-8" },
        React.createElement('div', { className: "text-center" },
          React.createElement('h2', { className: "text-lg font-semibold text-destructive mb-2" }, "Something went wrong"),
          React.createElement('p', { className: "text-sm text-muted-foreground mb-4" }, error.message),
          React.createElement('button', {
            onClick: resetError,
            className: "px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          }, "Try again")
        )
      );
    }

    return React.createElement(Component, props);
  });

  ErrorBoundary.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return ErrorBoundary;
};

// Optimized memoization utilities
export const memoizationUtils = {
  // Deep comparison for complex objects
  deepEqual: (a: any, b: any): boolean => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;
    if (typeof a !== 'object') return a === b;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!memoizationUtils.deepEqual(a[key], b[key])) return false;
    }

    return true;
  },

  // Stable reference for objects
  stableReference: <T>(value: T, deps: any[]): T => {
    const ref = useRef<T>(value);
    const prevDeps = useRef<any[]>(deps);

    if (!memoizationUtils.deepEqual(prevDeps.current, deps)) {
      ref.current = value;
      prevDeps.current = deps;
    }

    return ref.current;
  },
};

// Production-ready component optimizations
export const componentOptimizations = {
  // Optimized list rendering
  createOptimizedList: <T,>({
    items,
    renderItem,
    keyExtractor,
    emptyComponent,
    loadingComponent,
    errorComponent,
  }: {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    keyExtractor: (item: T, index: number) => string | number;
    emptyComponent?: React.ComponentType;
    loadingComponent?: React.ComponentType;
    errorComponent?: React.ComponentType<{ error: Error }>;
  }) => {
    return memo(() => {
      if (items.length === 0) {
        if (emptyComponent) {
          const EmptyComponent = emptyComponent;
          return React.createElement(EmptyComponent);
        }
        return React.createElement('div', null, 'No items found');
      }

      return React.createElement('div', null,
        items.map((item, index) =>
          React.createElement('div', { key: keyExtractor(item, index) },
            renderItem(item, index)
          )
        )
      );
    });
  },

  // Optimized form handling
  createOptimizedForm: <T extends Record<string, any>>({
    initialValues,
    onSubmit,
    validationSchema,
  }: {
    initialValues: T;
    onSubmit: (values: T) => void | Promise<void>;
    validationSchema?: (values: T) => Record<string, string>;
  }) => {
    return () => {
      const [values, setValues] = React.useState<T>(initialValues);
      const [errors, setErrors] = React.useState<Record<string, string>>({});
      const [isSubmitting, setIsSubmitting] = React.useState(false);

      const handleChange = useCallback((field: keyof T, value: any) => {
        setValues(prev => ({ ...prev, [field]: value }));
        if (errors[field as string]) {
          setErrors(prev => ({ ...prev, [field as string]: '' }));
        }
      }, [errors]);

      const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (validationSchema) {
          const validationErrors = validationSchema(values);
          if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
          }
        }

        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        } finally {
          setIsSubmitting(false);
        }
      }, [values, validationSchema, onSubmit]);

      return {
        values,
        errors,
        isSubmitting,
        handleChange,
        handleSubmit,
        setValues,
        setErrors,
      };
    };
  },
};

// Bundle optimization utilities
export const bundleOptimizations = {
  // Lazy load components with error boundaries
  createLazyComponent: <P extends object>(
    importFunc: () => Promise<{ default: React.ComponentType<P> }>,
    fallback?: React.ComponentType
  ) => {
    const LazyComponent = React.lazy(importFunc);
    
    return memo((props: P) => {
      const fallbackElement = fallback ? React.createElement(fallback) : React.createElement('div', null, 'Loading...');
      return React.createElement(React.Suspense, { fallback: fallbackElement },
        React.createElement(LazyComponent, props as any)
      );
    });
  },

  // Preload components
  preloadComponent: (importFunc: () => Promise<any>) => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(() => {
        importFunc().catch(console.error);
      });
    }
  },

  // Critical resource hints
  addResourceHints: (urls: string[]) => {
    if (typeof document !== 'undefined') {
      urls.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        link.as = url.endsWith('.css') ? 'style' : 'script';
        document.head.appendChild(link);
      });
    }
  },
};

// Memory optimization utilities
export const memoryOptimizations = {
  // Cleanup subscriptions
  useCleanup: (cleanup: () => void, deps: any[] = []) => {
    useEffect(() => {
      return cleanup;
    }, deps);
  },

  // Debounced state updates
  useDebouncedState: <T>(initialValue: T, delay: number) => {
    const [value, setValue] = React.useState<T>(initialValue);
    const timeoutRef = useRef<NodeJS.Timeout>();

    const debouncedSetValue = useCallback((newValue: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setValue(newValue);
      }, delay);
    }, [delay]);

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    return [value, debouncedSetValue] as const;
  },

  // Throttled callbacks
  useThrottledCallback: <T extends (...args: any[]) => any>(
    callback: T,
    delay: number,
    deps: any[] = []
  ) => {
    const timeoutRef = useRef<NodeJS.Timeout>();
    const lastCallRef = useRef<number>(0);

    return useCallback((...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          callback(...args);
        }, delay - (now - lastCallRef.current));
      }
    }, [callback, delay, ...deps]);
  },
};

// Production error handling
export const errorHandling = {
  // Global error handler
  setupGlobalErrorHandling: () => {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        // Send to error reporting service
      });

      window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        // Send to error reporting service
      });
    }
  },

  // Error reporting utility
  reportError: (error: Error, context?: Record<string, any>) => {
    console.error('Error reported:', error, context);
    // Implement error reporting service integration
  },

  // Retry utility
  retry: async <T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000
  ): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          throw lastError;
        }
        
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    throw lastError!;
  },
};

// Export all utilities
export const productionUtils = {
  performance: performanceUtils,
  memoization: memoizationUtils,
  components: componentOptimizations,
  bundle: bundleOptimizations,
  memory: memoryOptimizations,
  error: errorHandling,
};
