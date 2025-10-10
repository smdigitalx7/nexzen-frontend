export interface SchoolStudentAttendanceCreate {
  enrollment_id: number;
  attendance_month: string; // YYYY-MM-DD
  total_working_days: number;
  present_days: number;
  absent_days: number;
  remarks?: string | null;
}

export interface SchoolStudentAttendanceUpdate {
  present_days?: number;
  absent_days?: number;
  remarks?: string | null;
}

export interface SchoolStudentAttendanceRead {
  attendance_id: number;
  enrollment_id: number;
  attendance_month?: string | null;
  admission_no: string;
  roll_number: string;
  student_name: string;
  section_name: string;
  total_working_days?: number | null;
  present_days?: number | null;
  absent_days?: number | null;
  remarks?: string | null;
}

export interface SchoolStudentAttendancePaginatedResponse {
  data?: SchoolStudentAttendanceRead[] | null;
  total_pages?: number | null;
  current_page?: number | null;
  page_size?: number | null;
  total_count?: number | null;
}

export interface SchoolBulkStudentAttendanceCreate {
  attendance_month: string; // YYYY-MM-DD
  total_working_days: number;
  class_id: number;
  section_id?: number | null;
  academic_year_id?: number | null;
}

export interface SchoolClassAttendanceUpdateItem {
  enrollment_id: number;
  present_days: number;
  absent_days: number;
  remarks?: string | null;
}

export interface SchoolBulkCreateAttendanceResult {
  created_count: number;
  skipped_enrollment_ids: number[];
  total_requested: number;
}

export interface SchoolMonthAttendanceGroup {
  month_name: string;
  data: SchoolStudentAttendanceRead[];
}

export interface SchoolStudentAttendanceMonthlyGroupedResponse {
  groups: SchoolMonthAttendanceGroup[];
  total_pages?: number | null;
  current_page?: number | null;
  page_size?: number | null;
  total_count?: number | null;
}


