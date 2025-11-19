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
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - increased to reduce unnecessary refetches
      gcTime: 10 * 60 * 1000, // 10 minutes - increased to prevent premature garbage collection
      retry: 2, // Reduced from 3 to prevent excessive retries
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
