import { useState, useEffect, useCallback } from "react";
import { DashboardService } from "@/lib/services/general/dashboard.service";
import { useAuthStore } from "@/store/authStore";
import type {
  AdminDashboardResponse,
  AccountantDashboardResponse,
  AcademicDashboardResponse,
} from "@/lib/types/general/dashboards";
import {
  isAdminDashboard,
  isAccountantDashboard,
  isAcademicDashboard,
} from "@/lib/types/general/dashboards";

interface UseDashboardDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function useAdminDashboard(): UseDashboardDataReturn<AdminDashboardResponse> {
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
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
    // Don't fetch if not authenticated or no token
    if (!isAuthenticated || !token || !user) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await DashboardService.getDashboard();
      if (isAdminDashboard(response)) {
        setData(response);
      } else {
        setError("Unexpected dashboard response type");
        setData(null);
      }
    } catch (err: any) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
      setData(null);
    } finally {
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

function useAccountantDashboard(): UseDashboardDataReturn<AccountantDashboardResponse> {
  const [data, setData] = useState<AccountantDashboardResponse | null>(null);
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
    // Don't fetch if not authenticated or no token
    if (!isAuthenticated || !token || !user) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await DashboardService.getDashboard();
      if (isAccountantDashboard(response)) {
        setData(response);
      } else {
        setError("Unexpected dashboard response type");
        setData(null);
      }
    } catch (err: any) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
      setData(null);
    } finally {
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

function useAcademicDashboard(): UseDashboardDataReturn<AcademicDashboardResponse> {
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
    // Don't fetch if not authenticated or no token
    if (!isAuthenticated || !token || !user) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await DashboardService.getDashboard();
      if (isAcademicDashboard(response)) {
        setData(response);
      } else {
        setError("Unexpected dashboard response type");
        setData(null);
      }
    } catch (err: any) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
      setData(null);
    } finally {
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

export { useAdminDashboard, useAccountantDashboard, useAcademicDashboard };

