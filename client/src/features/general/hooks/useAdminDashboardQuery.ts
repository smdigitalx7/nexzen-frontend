import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "@/features/general/services/dashboard.service";
import { useAuthStore } from "@/core/auth/authStore";
import type { AdminDashboardResponse } from "@/features/general/types/dashboards";
import { isAdminDashboard } from "@/features/general/types/dashboards";

const QUERY_KEY = "admin-dashboard";

/**
 * React Query hook for admin dashboard with caching and refetch.
 * - staleTime: 2 minutes (cache used for 2 min before refetch)
 * - refetchOnMount: true so navigating to dashboard can refresh
 * - Returns refetch for manual refresh (e.g. refresh button)
 */
export function useAdminDashboardQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = useAuthStore((s) => s.user?.user_id);
  const branchId = useAuthStore((s) => s.currentBranch?.branch_id);
  const isLoggingOut = useAuthStore((s) => s.isLoggingOut);

  const query = useQuery({
    queryKey: [QUERY_KEY, userId, branchId],
    queryFn: async (): Promise<AdminDashboardResponse | null> => {
      const currentState = useAuthStore.getState();
      if (
        currentState.isLoggingOut ||
        !currentState.isAuthenticated ||
        !currentState.accessToken ||
        !currentState.user
      ) {
        throw new Error("Query cancelled: auth not ready");
      }
      const response = await DashboardService.getDashboard();
      if (isAdminDashboard(response)) {
        return response;
      }
      return null;
    },
    enabled: isAuthenticated && !!userId && !isLoggingOut,
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    refetchOnMount: true,
  });

  const data = query.data ?? null;
  const loading = query.isLoading;
  const isFetching = query.isFetching;
  let errorMessage: string | null = null;
  if (query.error instanceof Error) {
    errorMessage = query.error.message;
  } else if (query.error) {
    errorMessage = String(query.error);
  }
  const error = errorMessage ?? (query.isError ? "Failed to load dashboard" : null);

  return {
    dashboardData: data,
    loading,
    isFetching,
    error,
    refetch: query.refetch,
  };
}
