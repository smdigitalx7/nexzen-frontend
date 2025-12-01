import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/common/components/ui/button';
import { motion } from 'framer-motion';

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
  errorCode: string;
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
      errorCode: this.generateErrorCode(),
    };
  }

  private generateErrorCode(): string {
    // Generate a random error code like "ERR-500" or "ERR-404"
    const codes = ['500', '404', '503', '502', '504', '400', '403'];
    return `ERR-${codes[Math.floor(Math.random() * codes.length)]}`;
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const codes = ['500', '404', '503', '502', '504', '400', '403'];
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      errorCode: `ERR-${codes[Math.floor(Math.random() * codes.length)]}`,
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
    if (import.meta.env.DEV) {
      console.log('Error report:', errorReport);
    }
    
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
        errorCode: this.generateErrorCode(),
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
      errorCode: this.state.errorCode,
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
        if (import.meta.env.DEV) {
          console.log('Error details:', errorDetails);
        }
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

      const { error, errorId, retryCount, errorCode } = this.state;
      const canRetry = this.props.enableRetry && retryCount < this.maxRetries;

      return (
        <div className="fixed inset-0 z-[99999] overflow-hidden">
          {/* Background with gradient and pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50/30 to-amber-50/20 dark:from-slate-950 dark:via-red-950/20 dark:to-orange-950/10">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(239, 68, 68, 0.2) 1px, transparent 0)`,
                backgroundSize: '50px 50px'
              }} />
            </div>

            {/* Floating geometric shapes */}
            <motion.div
              animate={{
                y: [0, -30, 0],
                rotate: [0, 10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-20 left-10 w-40 h-40 bg-red-200/30 dark:bg-red-900/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                y: [0, 30, 0],
                rotate: [0, -10, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute bottom-20 right-10 w-60 h-60 bg-orange-200/30 dark:bg-orange-900/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                x: [0, 20, 0],
                y: [0, -20, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="absolute top-1/2 left-1/4 w-32 h-32 bg-amber-200/20 dark:bg-amber-900/10 rounded-lg blur-2xl"
            />
          </div>

          {/* Main Content - Full Page Layout */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 py-8">
            <div className="max-w-5xl w-full text-center space-y-8">
              {/* Large Error Code */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 100, damping: 10 }}
                className="relative"
              >
                <div className="text-[12rem] md:text-[16rem] font-black text-red-500/20 dark:text-red-500/10 leading-none select-none">
                  {errorCode.split('-')[1]}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="text-6xl md:text-8xl font-black text-red-600 dark:text-red-400"
                  >
                    {errorCode}
                  </motion.div>
                </div>
              </motion.div>

              {/* Error Illustration */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center space-y-6"
              >
                {/* Alert Icon */}
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse" />
                  <div className="relative bg-gradient-to-br from-red-500 to-orange-500 p-6 rounded-full shadow-xl">
                    <AlertTriangle className="w-12 h-12 text-white" />
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight"
                >
                  <span className="text-3xl md:text-4xl">⚠️</span> Something Went Wrong
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
                >
                  <span className="text-lg">😔</span> We're sorry, but something unexpected happened. Our team has been notified and is working on a fix.
                </motion.p>
              </motion.div>

              {/* Error Message - Only show one error message */}
              {error?.message && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="max-w-2xl mx-auto p-4 bg-red-50/50 dark:bg-red-950/20 rounded-lg border border-red-200/50 dark:border-red-900/30"
                >
                  <p className="text-sm font-medium text-red-700 dark:text-red-400 break-words">
                    <span className="mr-2">❌</span>
                    {error.message}
                  </p>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
              >
                {canRetry && (
                  <Button
                    onClick={this.handleRetry}
                    size="default"
                    className="px-6 py-2.5 text-sm bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-md group"
                  >
                    <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                    Try Again
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  size="default"
                  className="px-6 py-2.5 text-sm border rounded-md group"
                >
                  <Home className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  Go Home
                </Button>
                
                <Button
                  variant="outline"
                  onClick={this.handleReload}
                  size="default"
                  className="px-6 py-2.5 text-sm border rounded-md group"
                >
                  <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                  Reload Page
                </Button>
              </motion.div>

            </div>
          </div>
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