/**
 * Dashboard Service Example
 *
 * This is an example service file showing how to implement dashboard API calls.
 * Replace the endpoint URLs with your actual backend endpoints.
 */
// @ts-nocheck

import { Api } from "@/core/api";
import type {
  DashboardApiResponse,
  AdminDashboardResponse,
  AccountantDashboardResponse,
  AcademicDashboardResponse,
  DashboardQueryParams,
  DashboardApiError,
} from "@/features/general/types/dashboards";

export const DashboardService = {
  /**
   * Get Admin Dashboard Data
   *
   * @param params - Optional query parameters for filtering
   * @returns Promise with admin dashboard data
   */
  getAdminDashboard(params?: DashboardQueryParams) {
    return Api.get<DashboardApiResponse<AdminDashboardResponse>>(
      `/admin/dashboard`,
      params as
        | Record<string, string | number | boolean | null | undefined>
        | undefined
    );
  },

  /**
   * Get Accountant Dashboard Data
   *
   * @param params - Optional query parameters for filtering
   * @returns Promise with accountant dashboard data
   */
  getAccountantDashboard(params?: DashboardQueryParams) {
    return Api.get<DashboardApiResponse<AccountantDashboardResponse>>(
      `/accountant/dashboard`,
      params as
        | Record<string, string | number | boolean | null | undefined>
        | undefined
    );
  },

  /**
   * Get Academic Dashboard Data
   *
   * @param params - Optional query parameters for filtering
   * @returns Promise with academic dashboard data
   */
  getAcademicDashboard(params?: DashboardQueryParams) {
    return Api.get<DashboardApiResponse<AcademicDashboardResponse>>(
      `/academic/dashboard`,
      params as
        | Record<string, string | number | boolean | null | undefined>
        | undefined
    );
  },

  /**
   * Get Dashboard Data based on User Role
   *
   * This is a convenience method that automatically calls the correct
   * dashboard endpoint based on the user's role.
   *
   * @param role - User role (ADMIN, ACCOUNTANT, ACADEMIC)
   * @param params - Optional query parameters for filtering
   * @returns Promise with appropriate dashboard data
   */
  getDashboardByRole(
    role: "ADMIN" | "ACCOUNTANT" | "ACADEMIC",
    params?: DashboardQueryParams
  ) {
    switch (role) {
      case "ADMIN":
        return this.getAdminDashboard(params);
      case "ACCOUNTANT":
        return this.getAccountantDashboard(params);
      case "ACADEMIC":
        return this.getAcademicDashboard(params);
      default:
        throw new Error(`Unsupported role: ${role}`);
    }
  },
};

// ============================================================================
// Usage Example in a React Component
// ============================================================================

/*
import { useState, useEffect } from "react";
import { DashboardService } from "@/features/general/services/dashboard.service";
import { useAuthStore } from "@/core/auth/authStore";
import { isDashboardApiResponse, isDashboardApiError } from "@/features/general/types/dashboards";

export const DashboardComponent = () => {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user?.role) return;

      try {
        setLoading(true);
        setError(null);

        const response = await DashboardService.getDashboardByRole(user.role);

        if (isDashboardApiResponse(response.data)) {
          setDashboardData(response.data.data);
        } else if (isDashboardApiError(response.data)) {
          setError(response.data.error.message);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user?.role]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!dashboardData) return null;

  // Render dashboard based on role
  return (
    <div>
      Dashboard content for {user?.role}
    </div>
  );
};
*/
