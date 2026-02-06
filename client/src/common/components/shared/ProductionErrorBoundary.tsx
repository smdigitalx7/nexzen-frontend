import React, { Component, ErrorInfo, ReactNode } from "react";
import { RefreshCw, Home } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { ErrorFallback } from "./ErrorFallback";
import { router } from "@/routes/router";

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
    router.navigate("/", { replace: true });
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
        <ErrorFallback
          error={error}
          errorCode={errorCode}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          onReload={this.handleReload}
          enableRetry={canRetry}
        />
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
