export interface SchoolStudentAttendanceCreate {
  enrollment_id: number;
  attendance_month: number; // 1-12
  attendance_year: number; // 1900-2100
  total_working_days: number;
  present_days: number;
  absent_days: number;
  remarks?: string | null;
}

export interface SchoolStudentAttendanceUpdate {
  absent_days?: number;
  remarks?: string | null;
}

export interface SchoolStudentAttendanceRead {
  attendance_id: number;
  enrollment_id: number;
  attendance_month: number;
  attendance_year: number;
  admission_no: string;
  roll_number: string;
  student_name: string;
  section_name: string;
  total_working_days: number;
  present_days: number;
  absent_days: number;
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
  attendance_month: number; // 1-12
  attendance_year: number; // 1900-2100
  total_working_days: number;
  class_id: number;
  section_id?: number | null;
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


