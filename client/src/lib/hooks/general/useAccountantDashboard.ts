import { useState, useEffect, useCallback } from "react";
import { DashboardService } from "@/lib/services/general/dashboard.service";
import { useAuthStore } from "@/store/authStore";
import type { AccountantDashboardResponse } from "@/lib/types/general/dashboards";
import {
  isAccountantDashboard,
  isAdminDashboard,
  isAcademicDashboard,
} from "@/lib/types/general/dashboards";
import { ROLES } from "@/lib/constants";

interface UseDashboardDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAccountantDashboard(): UseDashboardDataReturn<AccountantDashboardResponse> {
  const [data, setData] = useState<AccountantDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { accessToken, isAuthenticated, user, currentBranch, isAuthInitializing, isLoggingOut } = useAuthStore();
  const token = accessToken; // Use accessToken directly

  // Reset state when user changes or logs out
  useEffect(() => {
    // CRITICAL: Also reset if auth is initializing or logout is in progress
    if (!isAuthenticated || !user || isAuthInitializing || isLoggingOut) {
      setData(null);
      setError(null);
      setLoading(false);
    } else {
      // Clear data when user, role, or branch changes (but keep loading state for new fetch)
      setData(null);
      setError(null);
    }
  }, [isAuthenticated, user?.user_id, user?.role, currentBranch?.branch_id, isAuthInitializing, isLoggingOut]);

  const fetchDashboard = useCallback(async () => {
    // CRITICAL: Read token directly from store at fetch time, not from closure
    // This ensures we always use the latest token, even during role switches
    const currentState = useAuthStore.getState();
    // Use accessToken directly (memory-only), fallback to token alias for backward compatibility
    const currentToken = currentState.accessToken || (currentState as any).token;
    const currentIsAuthenticated = currentState.isAuthenticated;
    const currentUser = currentState.user;
    
    // CRITICAL: Don't fetch if:
    // 1. Not authenticated or no token/user
    // 2. Auth is initializing (bootstrapAuth running)
    // 3. Logout is in progress (race condition protection)
    if (!currentIsAuthenticated || !currentToken || !currentUser || 
        currentState.isAuthInitializing || currentState.isLoggingOut) {
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
      if (isAccountantDashboard(response)) {
        setData(response);
        setLoading(false);
      } else {
        // If we got a different dashboard type, it means user doesn't have accountant role
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
  }, [token, isAuthenticated, user?.user_id, user?.role, currentBranch?.branch_id, isAuthInitializing, isLoggingOut]);

  useEffect(() => {
    // CRITICAL: Add cleanup to prevent requests after unmount/logout
    let isCancelled = false;
    
    const runFetch = async () => {
      // Check if cancelled before fetching
      if (isCancelled) return;
      
      await fetchDashboard();
    };
    
    runFetch();
    
    return () => {
      isCancelled = true;
    };
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard,
  };
}

