export interface SchoolEnrollmentCreate {
  student_id: number;
  class_id: number;
  section_id: number;
  roll_number: string;
  enrollment_date?: string | null;
  is_active?: boolean | null;
}

export interface SchoolEnrollmentUpdate {
  class_id?: number;
  section_id?: number;
  roll_number?: string;
  enrollment_date?: string | null;
  is_active?: boolean | null;
}

export interface SchoolEnrollmentRead {
  enrollment_id: number;
  enrollment_date?: string | null;
  student_id: number;
  admission_no: string;
  student_name: string;
  roll_number: string;
  class_id: number;
  class_name?: string;
  section_id: number;
  section_name: string;
}

export interface SchoolEnrollmentWithStudentDetails {
  enrollment_id: number;
  student_id: number;
  admission_no: string;
  student_name: string;
  class_id: number;
  class_name?: string;
  section_id: number;
  section_name?: string;
  roll_number: string;
  enrollment_date?: string | null;
  promoted: boolean;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface SchoolEnrollmentWithClassSectionDetails {
  class_id: number;
  class_name: string;
  students?: SchoolEnrollmentRead[] | null;
}

export interface SchoolEnrollmentFilterParams {
  class_id?: number;
  section_id?: number;
  page?: number;
  page_size?: number;
}

/** API list response: flat enrollments array + pagination */
export interface SchoolEnrollmentsPaginatedResponse {
  enrollments: SchoolEnrollmentRead[];
  total_count: number;
  current_page: number;
  page_size: number;
  total_pages: number;
  /** @deprecated Use enrollments. Kept for backward compat where code expects items. */
  items?: SchoolEnrollmentWithStudentDetails[];
}

export interface SchoolEnrollmentForSectionAssignment {
  enrollment_id: number;
  student_id: number;
  student_name: string;
  admission_no: string;
  class_id: number;
  class_name: string;
  current_section_id: number | null;
  current_section_name: string | null;
  current_roll_number: string;
  alphabetical_order: number;
}

/** POST /school/enrollments/generate-roll-numbers response */
export interface GenerateRollNumbersResponse {
  success: boolean;
  message: string;
  updated_count: number;
  enrollments: Array<{
    enrollment_id: number;
    student_id: number;
    student_name: string;
    roll_number: string;
  }>;
}

/** POST /school/enrollments/assign-sections response (optional success feedback) */
export interface AssignSectionsResponse {
  success: boolean;
  message: string;
  total_students?: number;
  assigned_students?: number;
  section_assignments?: Array<{
    section_id: number;
    section_name: string;
    student_count: number;
    students?: Array<{ student_name: string; status: string }>;
  }>;
  errors?: string[];
}

export interface SectionGroup {
  section_id: number;
  enrollment_ids: number[];
}

export interface AssignSectionsRequest {
  class_id: number;
  section_groups: SectionGroup[];
}

/**
 * PATCH /school/enrollments/{enrollment_id}/section/{section_id} - change section (path only, no body).
 * @deprecated Use path-only API; kept for reference.
 */
export interface ChangeEnrollmentSectionRequest {
  section_id: number;
  roll_number?: string;
}

/** PATCH /school/enrollments/{enrollment_id}/section/{section_id} response */
export interface ChangeEnrollmentSectionResponse {
  success: boolean;
  message: string;
}

/** GET /school/enrollments/dashboard/academic-total response */
export interface SchoolEnrollmentsAcademicTotalResponse {
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
