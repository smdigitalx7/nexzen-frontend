export interface CollegeStudentAttendanceCreate {
  enrollment_id: number;
  attendance_month: string; // YYYY-MM-DD
  total_working_days: number;
  present_days: number;
  absent_days: number;
  remarks?: string | null;
}

export interface CollegeStudentAttendanceUpdate {
  present_days?: number;
  absent_days?: number;
  remarks?: string | null;
}

export interface CollegeStudentAttendanceBulkCreate {
  attendance_month: string; // YYYY-MM-DD
  total_working_days: number;
  class_id: number;
  group_id: number;
}

export interface CollegeStudentAttendanceRead {
  attendance_id: number;
  enrollment_id: number;
  admission_no: string;
  roll_number: string;
  student_name: string;
  attendance_month: string; // YYYY-MM-DD
  total_working_days: number;
  present_days: number;
  absent_days: number;
  remarks?: string | null;
}

export interface CollegeStudentAttendanceBulkCreateResult {
  created_count: number;
  skipped_enrollment_ids: number[];
  total_requested: number;
}

export interface CollegeStudentAttendanceWithFullDetails {
  attendance_id: number;
  class_id: number;
  class_name: string;
  group_id: number;
  group_name: string;
  course_id: number;
  course_name: string;
  enrollment_id: number;
  admission_no: string;
  roll_number: string;
  student_name: string;
  attendance_month: string; // YYYY-MM-DD
  total_working_days: number;
  present_days: number;
  absent_days: number;
  remarks?: string | null;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
  created_by_name?: string | null;
  updated_by_name?: string | null;
}

export interface CollegeStudentsWithAttendanceMonthlyGrouped {
  month_name: string;
  students?: CollegeStudentAttendanceRead[] | null;
}

export interface CollegeStudentAttendanceWithClassGroup {
  class_id: number;
  class_name: string;
  group_id: number;
  group_name: string;
  attendance?: CollegeStudentsWithAttendanceMonthlyGrouped[] | null;
}

export interface CollegeStudentAttendanceFilterParams {
  class_id: number;
  group_id?: number;
  course_id?: number;
  year?: number;
  month?: number;
  page?: number;
  page_size?: number;
}

export interface CollegeStudentAttendancePaginatedResponse {
  students?: CollegeStudentAttendanceWithClassGroup[] | null;
  total_count: number;
  current_page: number;
  page_size?: number | null;
  total_pages: number;
}


