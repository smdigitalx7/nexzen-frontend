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
  section_id: number;
  section_name: string;
}

export interface SchoolEnrollmentWithStudentDetails {
  enrollment_id: number;
  student_id: number;
  admission_no: string;
  student_name: string;
  class_id: number;
  section_id: number;
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

export interface SchoolEnrollmentsPaginatedResponse {
  enrollments?: SchoolEnrollmentWithClassSectionDetails[] | null;
  total_count: number;
  current_page: number;
  page_size?: number | null;
  total_pages: number;
}


