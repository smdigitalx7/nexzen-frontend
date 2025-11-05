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

