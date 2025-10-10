// School module types aligned with backend Pydantic schemas

// Classes
export interface ClassRead {
  class_id: number;
  class_name: string;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface ClassCreate {
  class_name: string;
}

export interface ClassUpdate {
  class_name?: string;
}

export interface ClassWithSubjects extends ClassRead {
  subjects: string[];
}

// Sections
export interface SectionRead {
  section_id: number;
  class_id: number;
  section_name: string;
  current_enrollment: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface SectionCreate {
  section_name: string;
  current_enrollment: number;
  is_active?: boolean;
}

export interface SectionUpdate {
  section_name?: string;
  current_enrollment?: number;
  is_active?: boolean;
}

// Subjects
export interface SubjectRead {
  subject_id: number;
  subject_name: string;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface SubjectCreate {
  subject_name: string;
}

export interface SubjectUpdate {
  subject_name?: string;
}

// Class Subjects
export interface ClassSubjectRead {
  class_id: number;
  subject_id: number;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface ClassSubjectCreate {
  class_id: number;
  subject_id: number;
}

export interface ClassSubjectUpdate {
  class_id?: number;
  subject_id?: number;
}

// Tuition Fee Structures
export interface TuitionFeeStructureRead {
  fee_structure_id: number;
  class_id: number;
  book_fee: number;
  tuition_fee: number;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface TuitionFeeStructureCreate {
  class_id: number;
  book_fee: number;
  tuition_fee: number;
}

export interface TuitionFeeStructureUpdate {
  book_fee?: number;
  tuition_fee?: number;
}


// Enrollments
export interface EnrollmentCreate {
  student_id: number;
  class_id: number;
  section_id: number;
  roll_number: string;
  enrollment_date?: string | null;
  is_active?: boolean | null;
}

export interface EnrollmentUpdate {
  class_id?: number;
  section_id?: number;
  roll_number?: string;
  enrollment_date?: string | null;
  is_active?: boolean | null;
}

export interface EnrollmentRead {
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

export interface EnrollmentWithStudentDetails {
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

export interface EnrollmentsPaginatedResponse {
  enrollments: EnrollmentClassGroup[];
  total_count: number;
  current_page: number;
  page_size: number;
  total_pages: number;
}

export interface EnrollmentClassGroup {
  class_id: number;
  class_name: string;
  students: EnrollmentRead[];
}

export interface EnrollmentFilterParams {
  section_id?: number;
  admission_no?: string;
  page?: number;
  page_size?: number;
}

// Student Transport Assignments
export interface StudentTransportAssignmentCreate {
  enrollment_id: number;
  bus_route_id: number;
  slab_id: number;
  pickup_point?: string | null;
  start_date: string;
  end_date?: string | null;
  is_active?: boolean | null;
}

export interface StudentTransportAssignmentUpdate {
  bus_route_id?: number;
  slab_id?: number;
  pickup_point?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean | null;
}

export interface StudentTransportAssignmentRead {
  transport_assignment_id: number;
  enrollment_id: number;
  bus_route_id: number;
  route_name?: string | null;
  slab_id: number;
  slab_name?: string | null;
  admission_no?: string | null;
  student_name?: string | null;
  roll_number?: string | null;
  class_name?: string | null;
  section_name?: string | null;
  pickup_point?: string | null;
  start_date: string;
  end_date?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface StudentTransportAssignmentMinimal {
  transport_assignment_id: number;
  enrollment_id: number;
  admission_no: string;
  student_name: string;
  roll_number: string;
  section_name?: string | null;
  slab_name?: string | null;
  pickup_point?: string | null;
  is_active?: boolean | null;
}

export interface StudentTransportClassWiseResponse {
  class_id: number;
  class_name: string;
  students: StudentTransportAssignmentMinimal[];
}

export interface StudentTransportRouteWiseResponse {
  bus_route_id: number;
  route_name: string;
  classes: StudentTransportClassWiseResponse[];
}

