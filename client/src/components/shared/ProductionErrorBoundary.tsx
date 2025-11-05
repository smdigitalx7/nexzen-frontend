import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  enableRetry?: boolean;
  enableReport?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

export class ProductionErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error details
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report error to monitoring service
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount,
    };

    // Send to error reporting service
    console.log('Error report:', errorReport);
    
    // In production, send to actual error reporting service
    // Example: Sentry.captureException(error, { extra: errorReport });
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleReportBug = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
    };

    // Copy error details to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        alert('Error details copied to clipboard. Please share this with the development team.');
      })
      .catch(() => {
        console.log('Error details:', errorDetails);
        alert('Please copy the error details from the console and share with the development team.');
      });
  };

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorId, retryCount } = this.state;
      const canRetry = this.props.enableRetry && retryCount < this.maxRetries;

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Something went wrong</CardTitle>
              <CardDescription>
                We're sorry, but something unexpected happened. Our team has been notified.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error ID */}
              <div className="flex items-center justify-center">
                <Badge variant="outline" className="font-mono text-xs">
                  Error ID: {errorId}
                </Badge>
              </div>

              {/* Error Message */}
              <div className="rounded-lg bg-muted p-4">
                <h3 className="font-semibold text-sm mb-2">Error Details:</h3>
                <p className="text-sm text-muted-foreground font-mono">
                  {error?.message || 'An unknown error occurred'}
                </p>
              </div>

              {/* Retry Count */}
              {retryCount > 0 && (
                <div className="text-center text-sm text-muted-foreground">
                  Retry attempt: {retryCount} of {this.maxRetries}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {canRetry && (
                  <Button onClick={this.handleRetry} className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={this.handleReload}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>
              </div>

              {/* Report Bug Button */}
              {this.props.enableReport && (
                <div className="text-center">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={this.handleReportBug}
                    className="flex items-center gap-2 mx-auto"
                  >
                    <Bug className="h-4 w-4" />
                    Report Bug
                  </Button>
                </div>
              )}

              {/* Development Details */}
              {this.props.showDetails && process.env.NODE_ENV === 'development' && (
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                    Development Details
                  </summary>
                  <div className="mt-2 rounded-lg bg-muted p-4">
                    <pre className="text-xs overflow-auto scrollbar-hide">
                      {JSON.stringify({
                        error: error?.message,
                        stack: error?.stack,
                        componentStack: this.state.errorInfo?.componentStack,
                      }, null, 2)}
                    </pre>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for easier usage
export const withProductionErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ProductionErrorBoundary {...options}>
      <Component {...props} />
    </ProductionErrorBoundary>
  );

  WrappedComponent.displayName = `withProductionErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for error boundary context
export const useErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
};

export default ProductionErrorBoundary;
