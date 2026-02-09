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

/** List item may include class/group/course ids and names from API */
export type CollegeEnrollmentListRow = CollegeEnrollmentRead & {
  class_id?: number;
  group_id?: number;
  course_id?: number;
  class_name?: string;
  group_name?: string;
  course_name?: string;
};

/** API list response: flat enrollments array + pagination */
export interface CollegeEnrollmentsPaginatedResponse {
  enrollments: CollegeEnrollmentListRow[];
  total_count: number;
  current_page: number;
  page_size: number;
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
  class_id: number;
  group_id: number;
  page?: number;
  page_size?: number;
  course_id?: number;
  /** Full-text search. Optional. */
  search?: string | null;
}

/** GET /college/student-enrollments/dashboard/academic-total response */
export interface CollegeEnrollmentsAcademicTotalResponse {
  branch_id: number;
  branch_name: string;
  academic_year_id: number;
  academic_year_name: string;
  classes_count: number;
  sections_count: number;
  subjects_count: number;
  exams_count: number;
  tests_count: number;
  teachers_count: number;
  academic_years_count: number;
}


