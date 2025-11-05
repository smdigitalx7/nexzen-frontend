import { useState, useEffect, useCallback } from "react";
import { DashboardService } from "@/lib/services/general/dashboard.service";
import { useAuthStore } from "@/store/authStore";
import type { AcademicDashboardResponse } from "@/lib/types/general/dashboards";
import {
  isAcademicDashboard,
  isAdminDashboard,
  isAccountantDashboard,
} from "@/lib/types/general/dashboards";
import { ROLES } from "@/lib/constants";

interface UseDashboardDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAcademicDashboard(): UseDashboardDataReturn<AcademicDashboardResponse> {
  const [data, setData] = useState<AcademicDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, isAuthenticated, user, currentBranch } = useAuthStore();

  // Reset state when user changes or logs out
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setData(null);
      setError(null);
      setLoading(false);
    } else {
      // Clear data when user, role, or branch changes (but keep loading state for new fetch)
      setData(null);
      setError(null);
    }
  }, [isAuthenticated, user?.user_id, user?.role, currentBranch?.branch_id]);

  const fetchDashboard = useCallback(async () => {
    // CRITICAL: Read token directly from store at fetch time, not from closure
    // This ensures we always use the latest token, even during role switches
    const currentState = useAuthStore.getState();
    const currentToken = currentState.token;
    const currentIsAuthenticated = currentState.isAuthenticated;
    const currentUser = currentState.user;
    
    // Don't fetch if not authenticated or no token
    if (!currentIsAuthenticated || !currentToken || !currentUser) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // CRITICAL: Always fetch - let backend determine dashboard type from JWT token
      // Don't check user.role here because it might be stale during role switch
      const response = await DashboardService.getDashboard();
      if (isAcademicDashboard(response)) {
        setData(response);
        setLoading(false);
      } else {
        // If we got a different dashboard type, it means user doesn't have academic role
        // This is expected when switching roles - keep loading state so component doesn't show "No data"
        // The correct dashboard component will handle the data
        setData(null);
        setError(null);
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
      setData(null);
      setLoading(false);
    }
  }, [token, isAuthenticated, user?.user_id, user?.role, currentBranch?.branch_id]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard,
  };
}

