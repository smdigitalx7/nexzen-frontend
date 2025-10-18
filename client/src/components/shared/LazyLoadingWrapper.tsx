import React, { Suspense, Component, ErrorInfo, ReactNode } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
  { children: ReactNode; fallback?: ReactNode; onError?: (error: Error, errorInfo: ErrorInfo) => void },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode; onError?: (error: Error, errorInfo: ErrorInfo) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback error={this.state.error!} resetError={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}

// Enhanced Loading Spinner with better UX
const EnhancedLoadingSpinner = ({ message = "Loading..." }: { message?: string }) => (
  <div className="flex items-center justify-center h-64">
    <Card className="w-80">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
          </div>
        </div>
        <CardTitle className="text-lg">Loading Component</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <div className="space-y-2">
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Error Fallback Component
const ErrorFallback = ({ 
  error, 
  resetError 
}: { 
  error: Error; 
  resetError: () => void; 
}) => (
  <div className="flex items-center justify-center h-64">
    <Card className="w-80">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <CardTitle className="text-lg text-destructive">Failed to Load</CardTitle>
        <CardDescription>
          Something went wrong while loading this component.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="text-sm text-muted-foreground">
          <details className="text-left">
            <summary className="cursor-pointer hover:text-foreground">
              Error Details
            </summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
              {error.message}
            </pre>
          </details>
        </div>
        <Button 
          onClick={resetError}
          variant="outline"
          size="sm"
          className="hover-elevate"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  </div>
);

// Main LazyLoadingWrapper Component
export const LazyLoadingWrapper: React.FC<LazyLoadingWrapperProps> = ({
  children,
  fallback,
  errorFallback,
  onError
}) => {
  return (
    <SimpleErrorBoundary
      fallback={errorFallback}
      onError={onError}
    >
      <Suspense fallback={fallback || <EnhancedLoadingSpinner />}>
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
    setRetryCount(prev => prev + 1);
    
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
    componentPromise.catch(error => {
      console.warn('Preload failed:', error);
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
      onError={options?.retryable ? undefined : (error) => {
        console.error('Lazy component error:', error);
      }}
    >
      <LazyComponent {...props} />
    </LazyLoadingWrapper>
  );

  return WrappedComponent as T;
};

export default LazyLoadingWrapper;
