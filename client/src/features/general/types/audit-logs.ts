/**
 * Audit Logs Types
 * 
 * Types for audit logs API endpoints
 * Base path: /api/v1/audit-logs
 */

export interface ActivitySummary {
  user_full_name: string | null;
  user_id: number | null;
  branch_id: number | null;
  branch_name: string | null;
  activity_description: string;
  time_ago: string;
  category: string;
  count_or_amount: string;
  changed_at: string;
  changed_date: string;
}

export interface ActivitySummaryParams {
  user_id?: number | null;
  hours_back?: number;
  limit?: number;
}

export interface AuditLogReadable {
  audit_id: number;
  operation_type: string;
  branch_name: string;
  description: string;
}

export interface AuditLogReadableParams {
  start_date?: string | null;
  end_date?: string | null;
  limit?: number;
  offset?: number;
}

export interface AuditLogDeleteParams {
  start_date: string;
  end_date: string;
  confirm_deletion: boolean;
}

export interface AuditLogDeleteByIdsParams {
  audit_ids: number[];
  confirm_deletion: boolean;
}

export interface AuditLogDeleteResponse {
  deleted_count: number;
  oldest_log_date?: string | null;
  newest_log_date?: string | null;
  message: string;
}
