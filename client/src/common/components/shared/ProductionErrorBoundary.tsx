import React, { Component, ErrorInfo, ReactNode } from "react";
import { RefreshCw, Home } from "lucide-react";
import { Button } from "@/common/components/ui/button";

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
      errorId: "",
      retryCount: 0,
      errorCode: this.generateErrorCode(),
    };
  }

  private generateErrorCode(): string {
    // Generate a random error code like "ERR-500" or "ERR-404"
    const codes = ["500", "404", "503", "502", "504", "400", "403"];
    return `ERR-${codes[Math.floor(Math.random() * codes.length)]}`;
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const codes = ["500", "404", "503", "502", "504", "400", "403"];
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
    console.error("Error Boundary caught an error:", error, errorInfo);

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
      console.log("Error report:", errorReport);
    }

    // In production, send to actual error reporting service
    // Example: Sentry.captureException(error, { extra: errorReport });
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState((prevState) => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
        errorCode: this.generateErrorCode(),
      }));
    }
  };

  private handleGoHome = () => {
    window.location.href = "/";
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
    navigator.clipboard
      .writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        alert(
          "Error details copied to clipboard. Please share this with the development team."
        );
      })
      .catch(() => {
        if (import.meta.env.DEV) {
          console.log("Error details:", errorDetails);
        }
        alert(
          "Please copy the error details from the console and share with the development team."
        );
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

      const { error, retryCount, errorCode } = this.state;
      const canRetry = this.props.enableRetry && retryCount < this.maxRetries;

      return (
        <div className="fixed inset-0 z-[99999] overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
          {/* Main Content - Side by Side Layout */}
          <div className="flex-1 flex flex-col md:flex-row items-center justify-center px-3 sm:px-4 py-4 sm:py-6 md:py-8 gap-4 sm:gap-6 md:gap-8 lg:gap-12 min-h-0">
            {/* Left Side - Error Code */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center space-y-4 sm:space-y-5 md:space-y-6 w-full md:w-auto">
              <div className="relative w-full flex items-center justify-center">
                <div className="text-[6rem] sm:text-[7rem] md:text-[8rem] lg:text-[10rem] xl:text-[12rem] 2xl:text-[14rem] font-black text-slate-200 dark:text-slate-800 leading-none select-none">
                  {errorCode.split("-")[1]}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-700 dark:text-slate-300">
                    {errorCode}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error?.message && (
                <div className="w-full max-w-xs sm:max-w-sm md:max-w-md px-3 sm:px-4 py-2.5 sm:py-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900/50 shadow-sm mx-auto">
                  <p className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-400 break-words text-center">
                    <span className="mr-1.5 sm:mr-2 text-sm sm:text-base">
                      ❌
                    </span>
                    <span className="font-semibold">Error:</span>{" "}
                    {error.message}
                  </p>
                </div>
              )}
            </div>

            {/* Right Side - Content */}
            <div className="flex-1 max-w-2xl w-full space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8 text-center md:text-left">
              {/* Error Icon with Emoji */}
              <div className="flex flex-col space-y-3 sm:space-y-4">
                <div className="text-5xl sm:text-6xl md:text-7xl">🚨</div>

                {/* Title */}
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight px-2 sm:px-0">
                  Oops! Something Went Wrong
                </h1>

                {/* Description */}
                <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed px-2 sm:px-0">
                  <span className="text-lg sm:text-xl mr-1.5 sm:mr-2">😔</span>
                  We're sorry, but something unexpected happened. Our team has
                  been notified and is working on a fix.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2 sm:pt-2 w-full sm:w-auto sm:justify-start md:justify-start">
                {canRetry && (
                  <Button
                    onClick={this.handleRetry}
                    size="default"
                    className="w-full sm:w-auto px-5 sm:px-6 py-2.5 text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-shadow duration-200 rounded-md"
                  >
                    <RefreshCw className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Try Again
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  size="default"
                  className="w-full sm:w-auto px-5 sm:px-6 py-2.5 text-xs sm:text-sm border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 rounded-md"
                >
                  <Home className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Go Home
                </Button>

                <Button
                  variant="outline"
                  onClick={this.handleReload}
                  size="default"
                  className="w-full sm:w-auto px-5 sm:px-6 py-2.5 text-xs sm:text-sm border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 rounded-md"
                >
                  <RefreshCw className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Reload Page
                </Button>
              </div>
            </div>
          </div>

          {/* Footer - Professional Design */}
          <div className="w-full px-3 sm:px-4 md:px-6 pb-8 sm:pb-12 md:pb-16">
            <div className="max-w-6xl mx-auto">
              {/* Subtle Separator */}
              <div className="relative mb-4 sm:mb-6 md:mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6">
                {/* Help Text */}
                <div className="text-center mt-4 sm:mt-6 md:mt-8 px-2">
                  <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                    <span className="mr-1.5 sm:mr-2 text-sm sm:text-base md:text-lg">
                      💡
                    </span>
                    If this problem persists, please contact support with error
                    code{" "}
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs sm:text-sm md:text-base break-all sm:break-normal">
                      {errorCode}
                    </span>
                  </p>
                </div>

                {/* Contact Information */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 w-full px-2">
                  <a
                    href="mailto:contact@smdigitalx.com"
                    className="flex items-center gap-1.5 sm:gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors break-all sm:break-normal"
                  >
                    <span className="text-base sm:text-lg flex-shrink-0">
                      📧
                    </span>
                    <span className="text-center sm:text-left">
                      contact@smdigitalx.com
                    </span>
                  </a>

                  <div className="hidden sm:block w-px h-4 sm:h-5 bg-slate-300 dark:bg-slate-700" />

                  <a
                    href="tel:+918184919998"
                    className="flex items-center gap-1.5 sm:gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span className="text-base sm:text-lg flex-shrink-0">
                      📞
                    </span>
                    <span>+91 8184919998</span>
                  </a>
                </div>
              </div>
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
  options?: Omit<Props, "children">
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
