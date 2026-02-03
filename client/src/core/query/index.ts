import { QueryClient } from "@tanstack/react-query";

/**
 * ✅ OPTIMIZATION: Global query client configuration
 * 
 * Optimized for on-demand fetching:
 * - refetchOnWindowFocus: false - No auto-refetch on tab focus
 * - refetchOnReconnect: false - No auto-refetch on network reconnect
 * - refetchOnMount: false - No auto-refetch on component mount (use enabled: true explicitly where needed)
 * - refetchInterval: false - No background polling
 * 
 * Individual queries can override these defaults when needed.
 * 
 * NOTE: Queries should check isLoggingOut in their enabled option
 * to prevent execution during logout. The cancelQueries() call in logout()
 * will abort any in-flight queries.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - increased to reduce unnecessary refetches
      gcTime: 10 * 60 * 1000, // 10 minutes - increased to prevent premature garbage collection
      // ✅ OPTIMIZATION: Avoid retry storms on 4xx (422/400/etc)
      // - Retry only on network/5xx-type failures
      // - Never retry on 4xx since it usually means "bad request"/validation/permissions
      retry: (failureCount, error) => {
        const maybeStatus =
          // Our API client throws ApiError with .status
          (error as { status?: number } | null)?.status ??
          // Common patterns (in case something else throws)
          (error as { statusCode?: number } | null)?.statusCode ??
          (error as { response?: { status?: number } } | null)?.response?.status;

        if (typeof maybeStatus === "number" && maybeStatus >= 400 && maybeStatus < 500) {
          return false;
        }

        // Keep a small retry budget for flaky networks / 5xx
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // ✅ OPTIMIZATION: Disable all auto-refetch behaviors by default
      refetchOnWindowFocus: false, // No refetch on tab focus
      refetchOnReconnect: false, // No refetch on network reconnect
      refetchOnMount: false, // No refetch on component mount - queries must explicitly enable
      refetchInterval: false, // No background polling
    },
    mutations: {
      retry: 0,
      // Add mutation defaults to prevent blocking
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});
