export interface EmployeeAttendanceBase {
  employee_id: number;
  attendance_month: number; // 1-12
  attendance_year: number; // 1900-2100
  total_working_days: number;
  days_present: number;
  days_absent: number;
  paid_leaves: number;
  unpaid_leaves: number;
  late_arrivals: number;
  early_departures: number;
}

export interface EmployeeAttendanceCreate extends EmployeeAttendanceBase {}

export interface IndividualAttendanceCreateRequest {
  employee_id: number;
  total_working_days: number;
  month: number; // 1-12
  year: number; // 1900-2100
}

export interface IndividualAttendanceUpdateRequest {
  employee_id: number;
  month: number; // 1-12
  year: number; // 1900-2100
}

export interface EmployeeAttendanceUpdate {
  attendance_month?: number;
  attendance_year?: number;
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
  employee_name: string;
  attendance_month: number;
  attendance_year: number;
  total_working_days: number;
  days_present: number;
  paid_leaves: number;
  unpaid_leaves: number;
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

export interface EmployeeAttendanceMonthlyGrouped {
  month_name: string;
  attendances: EmployeeAttendanceRead[];
}

export interface AttendanceListResponse {
  data: EmployeeAttendanceRead[];
  total: number;
  total_pages: number;
  current_page: number;
  page_size: number;
}

export interface AttendanceDashboardStats {
  total_attendance_records: number;
  current_month_records: number;
  average_attendance_rate: number;
  total_days_absent: number;
  total_paid_leaves: number;
  total_unpaid_leaves: number;
  total_late_arrivals: number;
  total_early_departures: number;
  employees_with_perfect_attendance: number;
}
