export interface EmployeeAttendanceBase {
  employee_id: number;
  attendance_month: string; // YYYY-MM-DD format
  total_working_days: number;
  days_present: number;
  days_absent: number;
  paid_leaves: number;
  unpaid_leaves: number;
  late_arrivals: number; // Backend has default=0, so it's required
  early_departures: number; // Backend has default=0, so it's required
}

export interface EmployeeAttendanceCreate extends EmployeeAttendanceBase {}

export interface EmployeeAttendanceUpdate {
  total_working_days?: number;
  days_present?: number;
  days_absent?: number;
  paid_leaves?: number;
  unpaid_leaves?: number;
  late_arrivals?: number;
  early_departures?: number;
}

export interface EmployeeAttendanceRead {
  attendance_id: number;
  institute_id: number;
  employee_id: number;
  attendance_month: string;
  total_working_days: number;
  days_present: number;
  days_absent: number;
  paid_leaves: number;
  unpaid_leaves: number;
  late_arrivals: number;
  early_departures: number;
  created_at: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}

export interface AttendanceQueryParams {
  limit?: number;
  offset?: number;
  month?: number;
  year?: number;
}

export interface AttendanceListResponse {
  data: EmployeeAttendanceRead[];
  total: number;
  pages: number;
  current_page: number;
  limit?: number;
  offset?: number;
}
