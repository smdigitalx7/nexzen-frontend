/**
 * Types for Biometric Attendance Reports
 */

export interface BiometricPaginatedResponse<T> {
  data: T[];
  total: number;
  total_pages: number;
  current_page: number;
  page_size: number;
}

export interface DailyAttendanceRecord {
  attendance_date: string;
  employee_id: number;
  employee_code: string;
  employee_name: string;
  company_id: number;
  company_sname: string;
  department_id: number;
  department_sname: string;
  category_id: number;
  designation: string;
  shift_id: number;
  shift_fname: string;
  in_time: string | null;
  out_time: string | null;
  work_duration_hours: number;
  late_by_minutes: number;
  early_by_minutes: number;
  attendance_status: string;
  status_code: string;
  over_time_minutes: number;
  present_days: number;
  absent_days: number;
  is_on_leave: number;
  leave_type: string | null;
  is_weekly_off: number;
  is_holiday: number;
}

export interface MonthlySummaryRecord {
  report_year: number;
  report_month: number;
  employee_id: number;
  employee_code: string;
  employee_name: string;
  company_id: number;
  company_sname: string;
  department_id: number;
  department_sname: string;
  category_id: number;
  designation: string;
  total_calendar_days: number;
  total_present_days: number;
  total_absent_days: number;
  total_leave_days: number;
  total_weekly_offs: number;
  total_holidays: number;
  total_late_days: number;
  total_late_minutes: number;
  total_early_going_days: number;
  total_early_going_minutes: number;
  total_over_time_minutes: number;
  total_worked_hours: number;
}

export interface MonthlyMatrixRecord {
  report_year: number;
  report_month: number;
  employee_id: number;
  employee_code: string;
  employee_name: string;
  company_id: number;
  department_id: number;
  department_sname: string;
  category_id: number;
  total_present: number;
  total_absent: number;
  total_leaves: number;
  total_weekly_offs: number;
  total_holidays: number;
  [dayKey: `day_${number}`]: string | null | undefined | unknown; // day_1 to day_31 dynamic index signature
}

export interface YearlySummaryRecord {
  report_year: number;
  report_month: number;
  report_month_name: string;
  employee_id: number;
  employee_code: string;
  employee_name: string;
  company_id: number;
  company_sname: string;
  department_id: number;
  department_sname: string;
  category_id: number;
  total_present_days: number;
  total_absent_days: number;
  total_leave_days: number;
  total_weekly_offs: number;
  total_holidays: number;
  total_over_time_minutes: number;
  total_worked_hours: number;
}

export interface YearlyMatrixRecord {
  report_year: number;
  employee_id: number;
  employee_code: string;
  employee_name: string;
  company_id: number;
  department_id: number;
  department_sname: string;
  category_id: number;
  jan_present: number;
  feb_present: number;
  mar_present: number;
  apr_present: number;
  may_present: number;
  jun_present: number;
  jul_present: number;
  aug_present: number;
  sep_present: number;
  oct_present: number;
  nov_present: number;
  dec_present: number;
  yearly_total_present: number;
  yearly_total_absent: number;
  yearly_total_leaves: number;
  yearly_total_weekly_offs: number;
  yearly_total_holidays: number;
}
