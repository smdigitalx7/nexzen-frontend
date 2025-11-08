import { Api } from "@/lib/api";
import type {
  ActivitySummary,
  ActivitySummaryParams,
  AuditLogReadable,
  AuditLogReadableParams,
  AuditLogDeleteParams,
  AuditLogDeletePreview,
} from "@/lib/types/general/audit-logs";

/**
 * AuditLogsService - Handles all audit logs API operations
 * 
 * Available endpoints:
 * - GET /audit-logs/activity-summary - Get activity summary
 * - GET /audit-logs/readable - Get readable audit logs
 * - POST /audit-logs/preview-delete - Preview delete audit logs
 * - POST /audit-logs/delete - Delete audit logs
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
   * @param params - Query parameters (start_date, end_date, limit, offset)
   * @returns Promise<AuditLogReadable[]> - Array of readable audit logs
   */
  getReadableLogs(
    params?: AuditLogReadableParams
  ): Promise<AuditLogReadable[]> {
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

    return Api.get<AuditLogReadable[]>("/audit-logs/readable", queryParams);
  },

  /**
   * Preview delete audit logs by date range
   * Shows what would be deleted without actually deleting
   * @param params - Delete parameters
   * @returns Promise<AuditLogDeletePreview> - Preview of what would be deleted
   */
  previewDelete(
    params: AuditLogDeleteParams
  ): Promise<AuditLogDeletePreview> {
    return Api.post<AuditLogDeletePreview>("/audit-logs/preview-delete", {
      ...params,
      confirm_deletion: false,
    });
  },

  /**
   * Delete audit logs by date range
   * Requires confirm_deletion=true for safety
   * Cannot delete logs from the last 7 days
   * @param params - Delete parameters
   * @returns Promise<void>
   */
  deleteLogs(
    params: AuditLogDeleteParams
  ): Promise<void> {
    return Api.post<void>("/audit-logs/delete", {
      ...params,
      confirm_deletion: true,
    });
  },
};

