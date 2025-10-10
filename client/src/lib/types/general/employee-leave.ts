export interface EmployeeLeaveCreate {
  employee_id: number;
  leave_type: string;
  from_date: string; // YYYY-MM-DD format
  to_date: string; // YYYY-MM-DD format
  reason: string;
  total_days: number;
  applied_date?: string; // YYYY-MM-DD format, optional in backend
}

export interface EmployeeLeaveUpdate {
  leave_type?: string;
  from_date?: string;
  to_date?: string;
  reason?: string;
  total_days?: number;
  applied_date?: string;
}

export interface EmployeeLeaveRead {
  leave_id?: number;
  employee_id: number;
  employee_name?: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  reason: string;
  leave_status?: string;
  total_days: number;
  applied_date?: string;
  approved_by?: number;
  approved_date?: string;
  rejection_reason?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}

export interface EmployeeLeaveReject {
  rejection_reason: string;
}

export interface EmployeeLeaveQueryParams {
  limit?: number;
  offset?: number;
  leave_status?: string;
  branch_id?: number;
  month?: number;
  year?: number;
}

export interface EmployeeLeaveListResponse {
  data: EmployeeLeaveRead[];
  total: number;
  pages: number;
  current_page: number;
  pageSize?: number; // Backend uses pageSize, not limit/offset
}

export interface EmployeeLeaveSummaryResponse {
  employee_id: number;
  year: number;
  total_paid_leaves: number;
  total_unpaid_leaves: number;
  total_leaves: number;
}

export interface LeaveDashboardStats {
  total_leave_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  paid_leaves_count: number;
  unpaid_leaves_count: number;
  total_leave_days: number;
  leaves_this_month: number;
  leaves_this_year: number;
}

export interface RecentLeave {
  leave_id: number;
  employee_id: number;
  employee_name: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  total_days: number;
  leave_status: string;
  applied_date: string;
}