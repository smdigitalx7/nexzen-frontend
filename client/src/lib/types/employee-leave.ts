export interface EmployeeLeaveCreate {
  employee_id: number;
  leave_type: string;
  from_date: string; // YYYY-MM-DD format
  to_date: string; // YYYY-MM-DD format
  reason: string;
  total_days: number;
  applied_date: string; // YYYY-MM-DD format
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
  leave_id: number;
  employee_id: number;
  leave_type: string;
  from_date: string;
  to_date: string;
  reason: string;
  leave_status: string;
  total_days: number;
  applied_date: string;
  approved_by?: number;
  approved_date?: string;
  rejection_reason?: string;
  created_at: string;
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
  limit?: number;
  offset?: number;
}

export interface EmployeeLeaveSummaryResponse {
  employee_id: number;
  year: number;
  total_paid_leaves: number;
  total_unpaid_leaves: number;
  total_leaves: number;
}
