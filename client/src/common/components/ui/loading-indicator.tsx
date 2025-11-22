import React from 'react';
import { cn } from '@/common/utils';
import { Loader } from './ProfessionalLoader';
import { useLoading } from '@/common/contexts/LoadingContext';

interface LoadingIndicatorProps {
  id?: string;
  message?: string;
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'progress' | 'success' | 'error';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showMessage?: boolean;
  overlay?: boolean;
  fullScreen?: boolean;
  persistent?: boolean;
  progress?: number;
  showPercentage?: boolean;
  onRetry?: () => void;
  retryMessage?: string;
  maxRetries?: number;
  retryCount?: number;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  id,
  message = 'Loading...',
  variant = 'spinner',
  size = 'md',
  className,
  showMessage = true,
  overlay = false,
  fullScreen = false,
  persistent = false,
  progress,
  showPercentage = false,
  onRetry,
  retryMessage = 'Something went wrong. Please try again.',
  maxRetries = 3,
  retryCount = 0
}) => {
  const { addLoading, removeLoading, updateLoading, isLoading, getLoadingItem } = useLoading();

  // Auto-manage loading state if id is provided
  React.useEffect(() => {
    if (id) {
      addLoading({
        id,
        message,
        variant,
        size,
        overlay,
        fullScreen,
        persistent,
        progress
      });

      return () => {
        if (!persistent) {
          removeLoading(id);
        }
      };
    }
  }, [id, message, variant, size, overlay, fullScreen, persistent, progress, addLoading, removeLoading]);

  // Update progress if provided
  React.useEffect(() => {
    if (id && progress !== undefined) {
      updateLoading(id, { progress });
    }
  }, [id, progress, updateLoading]);

  // Check if this specific item is loading
  const isItemLoading = id ? isLoading(id) : true;
  const loadingItem = id ? getLoadingItem(id) : null;

  if (!isItemLoading) {
    return null;
  }

  const currentMessage = loadingItem?.message || message;
  const currentProgress = loadingItem?.progress || progress;
  const currentVariant = loadingItem?.variant || variant;

  // Handle retry state
  if (retryCount >= maxRetries && onRetry) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-6 text-center', className)}>
        <div className="text-destructive mb-4">
          <svg className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm">{retryMessage}</p>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Maximum retry attempts reached.
        </p>
      </div>
    );
  }

  if (retryCount > 0 && onRetry) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-6 text-center', className)}>
        <div className="text-destructive mb-4">
          <svg className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm">{retryMessage}</p>
        </div>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again ({retryCount + 1}/{maxRetries})
        </button>
      </div>
    );
  }

  // Render appropriate loading component
  if (currentVariant === 'progress' && currentProgress !== undefined) {
    // For progress, use Data loader with a custom message showing progress
    return (
      <div className={cn("flex flex-col items-center justify-center py-8", className)}>
        <Loader.Data message={currentMessage || `Loading... ${Math.round(currentProgress)}%`} />
        {showPercentage && (
          <div className="mt-4 w-64 bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(currentProgress, 100)}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  // Map variants to Loader components
  if (fullScreen) {
    return <Loader.Page message={currentMessage} />;
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/50">
        <Loader.Data message={currentMessage} />
      </div>
    );
  }

  if (currentVariant === 'skeleton') {
    return <Loader.Card lines={3} />;
  }

  return <Loader.Data message={currentMessage} />;
};

// Specialized loading indicators
export const PageLoadingIndicator: React.FC<{ message?: string }> = ({ message }) => (
  <LoadingIndicator
    variant="spinner"
    size="lg"
    message={message}
    fullScreen
  />
);

export const DataLoadingIndicator: React.FC<{ 
  message?: string; 
  skeleton?: boolean;
  id?: string;
}> = ({ message, skeleton = false, id }) => (
  <LoadingIndicator
    id={id}
    variant={skeleton ? 'skeleton' : 'spinner'}
    size="md"
    message={message}
  />
);

export const ButtonLoadingIndicator: React.FC<{ 
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  id?: string;
}> = ({ size = 'sm', id }) => (
  <LoadingIndicator
    id={id}
    variant="spinner"
    size={size}
    showMessage={false}
  />
);

export const ProgressIndicator: React.FC<{
  progress: number;
  message?: string;
  showPercentage?: boolean;
  id?: string;
}> = ({ progress, message, showPercentage = false, id }) => (
  <LoadingIndicator
    id={id}
    variant="progress"
    size="md"
    message={message}
    progress={progress}
    showPercentage={showPercentage}
  />
);

export const SkeletonIndicator: React.FC<{
  lines?: number;
  id?: string;
}> = ({ lines = 3, id }) => (
  <LoadingIndicator
    id={id}
    variant="skeleton"
    size="md"
    showMessage={false}
  />
);

export default LoadingIndicator;
