// College Enrollments Types (mirrors backend schemas)

export interface CollegeEnrollmentCreate {
  student_id: number;
  class_id: number;
  group_id: number;
  course_id?: number | null;
  roll_number: string;
  enrollment_date?: string | null; // ISO datetime
  is_active?: boolean | null;
}

export interface CollegeEnrollmentUpdate extends Partial<CollegeEnrollmentCreate> {}

export interface CollegeEnrollmentRead {
  enrollment_id: number;
  enrollment_date?: string | null;
  student_id: number;
  admission_no: string;
  student_name: string;
  roll_number: string;
  is_active?: boolean | null;
  promoted?: boolean | null;
}

export interface CollegeEnrollmentWithClassGroupCourseDetails {
  class_id: number;
  class_name: string;
  group_id: number;
  group_name: string;
  course_id?: number | null;
  course_name?: string | null;
  students?: CollegeEnrollmentRead[] | null;
}

export interface CollegeEnrollmentsPaginatedResponse {
  enrollments?: CollegeEnrollmentWithClassGroupCourseDetails[] | null;
  total_count: number;
  current_page: number;
  page_size?: number | null;
  total_pages: number;
}

export interface CollegeEnrollmentWithStudentDetails {
  enrollment_id: number;
  student_id: number;
  admission_no: string;
  student_name: string;
  class_id: number;
  class_name: string;
  group_id: number;
  group_name: string;
  course_id?: number | null;
  course_name?: string | null;
  roll_number: string;
  enrollment_date?: string | null;
  is_active?: boolean | null;
  promoted?: boolean | null;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  created_by_name?: string | null;
  updated_by?: number | null;
  updated_by_name?: string | null;
}

export interface CollegeEnrollmentFilterParams {
  class_id: number; // Required
  group_id: number; // Required
  page?: number;
  page_size?: number;
  course_id?: number;
}


