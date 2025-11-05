/**
 * Dashboard Service
 * 
 * Handles all dashboard-related API operations.
 * Uses the unified /dashboard endpoint which automatically returns
 * the appropriate dashboard based on user's highest priority role.
 * 
 * Role Priority Order (highest to lowest):
 * 1. INSTITUTE_ADMIN - Returns comprehensive admin dashboard
 * 2. ADMIN - Returns comprehensive admin dashboard
 * 3. ACCOUNTANT - Returns financial-focused dashboard
 * 4. ACADEMIC - Returns academic-focused dashboard
 */

import { Api } from "@/lib/api";
import type {
  DashboardResponse,
  AdminDashboardResponse,
  AccountantDashboardResponse,
  AcademicDashboardResponse,
  DashboardQueryParams,
} from "@/lib/types/general/dashboards";
import {
  isAdminDashboard,
  isAccountantDashboard,
  isAcademicDashboard,
} from "@/lib/types/general/dashboards";

export const DashboardService = {
  /**
   * Get Dashboard Data
   * 
   * Automatically returns the appropriate dashboard based on user's highest priority role.
   * The backend determines which dashboard to return based on the user's roles from the JWT token.
   * 
   * @param params - Optional query parameters for date filtering
   * @returns Promise with dashboard data (admin, accountant, or academic)
   */
  getDashboard(
    params?: DashboardQueryParams
  ): Promise<DashboardResponse> {
    return Api.get<DashboardResponse>("/dashboard", params as
      | Record<string, string | number | boolean | null | undefined>
      | undefined
    );
  },

  /**
   * Type guard helpers to check dashboard type
   */
  isAdmin: isAdminDashboard,
  isAccountant: isAccountantDashboard,
  isAcademic: isAcademicDashboard,
};

// Export type guards for convenience
export {
  isAdminDashboard,
  isAccountantDashboard,
  isAcademicDashboard,
};

