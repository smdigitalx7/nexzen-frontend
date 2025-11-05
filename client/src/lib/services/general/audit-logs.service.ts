import { Api } from "@/lib/api";
import type {
  ActivitySummary,
  ActivitySummaryParams,
} from "@/lib/types/general/audit-logs";

/**
 * AuditLogsService - Handles all audit logs API operations
 * 
 * Available endpoints:
 * - GET /audit-logs/activity-summary - Get activity summary
 */
export const AuditLogsService = {
  /**
   * Get activity summary from view
   * Returns dashboard-style activity summaries for the last N hours
   * @param params - Query parameters
   * @returns Promise<ActivitySummary[]> - Array of activity summaries
   */
  getActivitySummary(
    params?: ActivitySummaryParams
  ): Promise<ActivitySummary[]> {
    const queryParams: Record<string, string | number | null | undefined> = {};
    
    if (params?.user_id !== undefined) {
      queryParams.user_id = params.user_id;
    }
    if (params?.hours_back !== undefined) {
      queryParams.hours_back = params.hours_back;
    }
    if (params?.limit !== undefined) {
      queryParams.limit = params.limit;
    }

    return Api.get<ActivitySummary[]>("/audit-logs/activity-summary", queryParams);
  },
};

