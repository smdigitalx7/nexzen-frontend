import React, { Suspense, Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loading, LoadingStates } from "@/components/ui/loading";

interface LazyLoadingWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// Simple Error Boundary Component
class SimpleErrorBoundary extends Component<
  {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
  },
  ErrorBoundaryState
> {
  constructor(props: {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <ErrorFallback
            error={this.state.error!}
            resetError={() => this.setState({ hasError: false })}
          />
        )
      );
    }

    return this.props.children;
  }
}

// Simple Loading Spinner - full screen to match Router hydration loader
const SimpleLoadingSpinner = ({
  message = "Loading...",
}: {
  message?: string;
}) => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
);

// Simple Error Fallback Component
const ErrorFallback = ({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) => (
  <div className="flex items-center justify-center h-32">
    <div className="text-center space-y-3">
      <AlertCircle className="h-6 w-6 text-destructive mx-auto" />
      <p className="text-sm text-destructive">Failed to load component</p>
      <Button onClick={resetError} variant="outline" size="sm">
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </div>
  </div>
);

// Main LazyLoadingWrapper Component
export const LazyLoadingWrapper: React.FC<LazyLoadingWrapperProps> = ({
  children,
  fallback,
  errorFallback,
  onError,
}) => {
  return (
    <SimpleErrorBoundary fallback={errorFallback} onError={onError}>
      <Suspense fallback={fallback || <SimpleLoadingSpinner />}>
        {children}
      </Suspense>
    </SimpleErrorBoundary>
  );
};

// Hook for lazy loading with retry functionality
export const useLazyRetry = () => {
  const [retryCount, setRetryCount] = React.useState(0);
  const [isRetrying, setIsRetrying] = React.useState(false);

  const retry = React.useCallback(() => {
    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);

    // Reset retry state after a short delay
    setTimeout(() => {
      setIsRetrying(false);
    }, 1000);
  }, []);

  return { retryCount, isRetrying, retry };
};

// Preload function for critical components
export const preloadComponent = (importFn: () => Promise<any>) => {
  return () => {
    const componentPromise = importFn();
    componentPromise.catch((error) => {
      console.warn("Preload failed:", error);
    });
    return componentPromise;
  };
};

// Lazy component factory with enhanced features
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options?: {
    fallback?: React.ReactNode;
    preload?: boolean;
    retryable?: boolean;
  }
) => {
  const LazyComponent = React.lazy(importFn);

  if (options?.preload) {
    // Preload the component
    preloadComponent(importFn)();
  }

  const WrappedComponent = (props: React.ComponentProps<T>) => (
    <LazyLoadingWrapper
      fallback={options?.fallback}
      onError={
        options?.retryable
          ? undefined
          : (error) => {
              console.error("Lazy component error:", error);
            }
      }
    >
      <LazyComponent {...props} />
    </LazyLoadingWrapper>
  );

  return WrappedComponent as T;
};

export default LazyLoadingWrapper;
