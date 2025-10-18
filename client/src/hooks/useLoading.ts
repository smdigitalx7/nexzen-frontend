import { useState, useCallback, useRef, useEffect } from 'react';

export interface LoadingState {
  isLoading: boolean;
  error: Error | null;
  retryCount: number;
  progress: number;
}

export interface UseLoadingOptions {
  initialLoading?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
  onRetry?: (retryCount: number) => void;
}

export interface UseLoadingReturn extends LoadingState {
  startLoading: () => void;
  stopLoading: () => void;
  setError: (error: Error | null) => void;
  setProgress: (progress: number) => void;
  retry: () => void;
  reset: () => void;
  executeWithLoading: <T>(asyncFn: () => Promise<T>) => Promise<T | null>;
}

export const useLoading = (options: UseLoadingOptions = {}): UseLoadingReturn => {
  const {
    initialLoading = false,
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    onSuccess,
    onRetry
  } = options;

  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setProgress(0);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setProgress(100);
    onSuccess?.();
  }, [onSuccess]);

  const handleError = useCallback((error: Error) => {
    setError(error);
    setIsLoading(false);
    onError?.(error);
  }, [onError]);

  const retry = useCallback(() => {
    if (retryCount >= maxRetries) {
      return;
    }

    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    setError(null);
    setIsLoading(true);
    setProgress(0);
    
    onRetry?.(newRetryCount);

    // Auto-retry after delay if retry count is less than max
    if (newRetryCount < maxRetries) {
      retryTimeoutRef.current = setTimeout(() => {
        retry();
      }, retryDelay);
    }
  }, [retryCount, maxRetries, retryDelay, onRetry]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setRetryCount(0);
    setProgress(0);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, []);

  const executeWithLoading = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T | null> => {
    try {
      startLoading();
      const result = await asyncFn();
      stopLoading();
      return result;
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Unknown error'));
      return null;
    }
  }, [startLoading, stopLoading, handleError]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    error,
    retryCount,
    progress,
    startLoading,
    stopLoading,
    setError,
    setProgress,
    retry,
    reset,
    executeWithLoading
  };
};

// Hook for managing multiple loading states
export const useMultipleLoading = (keys: string[]) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    keys.reduce((acc, key) => ({ ...acc, [key]: false }), {})
  );

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: isLoading }));
  }, []);

  const isAnyLoading = Object.values(loadingStates).some(Boolean);
  const isAllLoading = Object.values(loadingStates).every(Boolean);

  return {
    loadingStates,
    setLoading,
    isAnyLoading,
    isAllLoading
  };
};

// Hook for debounced loading states
export const useDebouncedLoading = (delay: number = 300) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDebouncedLoading, setIsDebouncedLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (loading) {
      // Show loading immediately
      setIsDebouncedLoading(true);
    } else {
      // Hide loading after delay
      timeoutRef.current = setTimeout(() => {
        setIsDebouncedLoading(false);
      }, delay);
    }
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    isDebouncedLoading,
    setLoading
  };
};

// Hook for progress tracking
export const useProgress = (initialProgress: number = 0) => {
  const [progress, setProgress] = useState(initialProgress);
  const [isComplete, setIsComplete] = useState(false);

  const updateProgress = useCallback((newProgress: number) => {
    const clampedProgress = Math.min(100, Math.max(0, newProgress));
    setProgress(clampedProgress);
    setIsComplete(clampedProgress >= 100);
  }, []);

  const reset = useCallback(() => {
    setProgress(0);
    setIsComplete(false);
  }, []);

  return {
    progress,
    isComplete,
    updateProgress,
    reset
  };
};

export default useLoading;
