import { Api } from "@/core/api";
import type {
  ActivitySummary,
  ActivitySummaryParams,
  AuditLogReadable,
  AuditLogReadableParams,
  AuditLogDeleteParams,
  AuditLogDeleteByIdsParams,
  AuditLogDeleteResponse,
  AuditLogPaginatedResponse
} from "@/features/general/types/audit-logs";

/**
 * AuditLogsService - Handles all audit logs API operations
 * 
 * Available endpoints:
 * - GET /audit-logs/activity-summary - Get activity summary
 * - GET /audit-logs/readable - Get readable audit logs
 * - POST /audit-logs/delete - Delete audit logs by date range
 * - POST /audit-logs/delete-by-ids - Delete audit logs by IDs
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

  /**
   * Get readable audit logs
   * Returns audit log entries with human-readable descriptions
   * @param params - Query parameters (start_date, end_date, limit, offset, page, page_size)
   * @returns Promise<AuditLogPaginatedResponse> - Paginated readable audit logs
   */
  getReadableLogs(
    params?: AuditLogReadableParams & { page?: number; page_size?: number }
  ): Promise<AuditLogPaginatedResponse> {
    const queryParams: Record<string, string | number | null | undefined> = {};
    
    if (params?.start_date !== undefined && params?.start_date !== null) {
      queryParams.start_date = params.start_date;
    }
    if (params?.end_date !== undefined && params?.end_date !== null) {
      queryParams.end_date = params.end_date;
    }
    if (params?.limit !== undefined) {
      queryParams.limit = params.limit;
    }
    if (params?.offset !== undefined) {
      queryParams.offset = params.offset;
    }
    if (params?.page !== undefined) {
      queryParams.page = params.page;
    }
    if (params?.page_size !== undefined) {
      queryParams.page_size = params.page_size;
    }

    return Api.get<AuditLogPaginatedResponse>("/audit-logs/readable", queryParams);
  },

  /**
   * Delete audit logs by date range
   * Requires confirm_deletion=true for safety
   * Cannot delete logs from the last 7 days
   * @param params - Delete parameters
   * @returns Promise<AuditLogDeleteResponse>
   */
  deleteLogs(
    params: AuditLogDeleteParams
  ): Promise<AuditLogDeleteResponse> {
    return Api.post<AuditLogDeleteResponse>("/audit-logs/delete", {
      start_date: params.start_date,
      end_date: params.end_date,
      confirm_deletion: true,
    });
  },

  /**
   * Delete audit logs by audit IDs
   * Requires confirm_deletion=true for safety
   * Only deletes audit logs belonging to the user's branch
   * @param params - Delete parameters with audit_ids array
   * @returns Promise<AuditLogDeleteResponse>
   */
  deleteLogsByIds(
    params: AuditLogDeleteByIdsParams
  ): Promise<AuditLogDeleteResponse> {
    return Api.post<AuditLogDeleteResponse>("/audit-logs/delete-by-ids", {
      audit_ids: params.audit_ids,
      confirm_deletion: true,
    });
  },
};
