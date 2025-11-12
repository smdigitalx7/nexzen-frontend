import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - increased to reduce unnecessary refetches
      gcTime: 10 * 60 * 1000, // 10 minutes - increased to prevent premature garbage collection
      retry: 2, // Reduced from 3 to prevent excessive retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      // Prevent refetch storms
      refetchOnMount: true,
      refetchInterval: false,
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
