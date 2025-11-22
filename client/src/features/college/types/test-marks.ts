export interface CollegeTestMarkCreate {
  enrollment_id: number;
  test_id: number;
  subject_id: number;
  marks_obtained?: number | null;
  percentage?: number | null;
  grade?: string | null;
  remarks?: string | null;
  conducted_at?: string | null;
}

export interface CollegeTestMarkUpdate {
  marks_obtained: number;
  percentage: number;
  grade: string;
  remarks: string;
  conducted_at: string;
}

export interface CollegeTestMarkMinimalRead {
  mark_id: number;
  enrollment_id: number;
  student_name: string;
  roll_number: string;
  admission_no: string;
  class_name: string;
  group_name: string;
  marks_obtained: number | null;
  percentage: number | null;
  grade: string | null;
  remarks: string | null;
  conducted_at: string | null;
}

export interface CollegeTestGroupAndClassResponse {
  test_id: number;
  test_name: string;
  conducted_at: string;
  subject_id: number;
  subject_name: string;
  students: CollegeTestMarkMinimalRead[] | null;
}

export interface CollegeTestMarkFullReadResponse {
  mark_id: number;
  enrollment_id: number;
  student_name: string;
  roll_number: string;
  admission_no: string;
  class_name: string;
  group_name: string;
  test_id: number;
  test_name: string;
  subject_id: number;
  subject_name: string;
  marks_obtained: number | null;
  percentage: number | null;
  grade: string | null;
  remarks: string | null;
  conducted_at: string | null;
  created_at: string;
  updated_at: string | null;
  created_by: number | null;
  updated_by: number | null;
}

export interface CollegeCreateTestMarkBulk {
  class_id: number;
  section_id?: number;
  test_id: number;
  subject_id: number;
  conducted_at: string;
}

export interface CollegeTestMarkBulkCreateResult {
  created_count: number;
  skipped_enrollment_ids: number[];
  total_requested: number;
}

export interface CollegeTestMarksListParams {
  class_id: number; // Required
  group_id: number; // Required
  test_id: number; // Required
  subject_id: number; // Required
  page?: number;
  pageSize?: number;
}

// Multiple subjects operations
export interface CollegeTestSubjectMarkItem {
  subject_id: number;
  marks_obtained?: number | null;
  remarks?: string | null;
  subject_name?: string | null;
}

export interface CollegeCreateTestMarksMultipleSubjects {
  enrollment_id: number;
  test_id: number;
  subjects: CollegeTestSubjectMarkItem[];
  student_name?: string | null;
  test_name?: string | null;
}

export interface CollegeTestMarksMultipleSubjectsResult {
  success: boolean;
  message: string;
  enrollment_id: number;
  test_id: number;
  created_count: number;
  skipped_count: number;
  total_requested: number;
  errors?: Array<{
    subject_id: number;
    subject_name?: string;
    error: string;
  }>;
}