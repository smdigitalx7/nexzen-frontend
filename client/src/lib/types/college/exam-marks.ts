export interface CollegeExamMarkCreate {
  enrollment_id: number;
  exam_id: number;
  subject_id: number;
  marks_obtained?: number | null;
  percentage?: number | null;
  grade?: string | null;
  remarks?: string | null;
  conducted_at?: string | null;
}

export interface CollegeExamMarkUpdate {
  marks_obtained: number;
  percentage: number;
  grade: string;
  remarks: string;
  conducted_at: string;
}

export interface CollegeExamMarkMinimalRead {
  mark_id: number;
  enrollment_id: number;
  admission_no: string;
  student_name: string;
  roll_number: string;
  marks_obtained: number | null;
  percentage: number | null;
  grade: string | null;
  remarks: string | null;
  conducted_at: string | null;
}

export interface CollegeExamSubjectWiseResponse {
  subject_id: number;
  subject_name: string;
  students: CollegeExamMarkMinimalRead[] | null;
}

export interface CollegeExamGroupAndClassResponse {
  exam_id: number;
  exam_name: string;
  conducted_at: string | null;
  subjects: CollegeExamSubjectWiseResponse[] | null;
}

export interface CollegeExamMarkFullReadResponse {
  mark_id: number;
  enrollment_id: number;
  student_name: string;
  roll_number: string;
  class_name: string;
  group_name: string;
  exam_id: number;
  exam_name: string;
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

export interface CollegeCreateExamMarkBulk {
  class_id: number;
  group_id?: number;
  exam_id: number;
  subject_id: number;
  conducted_at: string;
}

export interface CollegeExamMarkBulkCreateResult {
  created_count: number;
  skipped_enrollment_ids: number[];
  total_requested: number;
}

export interface CollegeExamMarksListParams {
  class_id: number; // Required
  group_id: number; // Required
  exam_id: number; // Required
  subject_id: number; // Required
  page?: number;
  pageSize?: number;
}

// Multiple subjects operations
export interface CollegeSubjectMarkItem {
  subject_id: number;
  marks_obtained?: number | null;
  remarks?: string | null;
  subject_name?: string | null;
}

export interface CollegeCreateExamMarksMultipleSubjects {
  enrollment_id: number;
  exam_id: number;
  subjects: CollegeSubjectMarkItem[];
  student_name?: string | null;
  exam_name?: string | null;
}

export interface CollegeExamMarksMultipleSubjectsResult {
  success: boolean;
  message: string;
  enrollment_id: number;
  exam_id: number;
  created_count: number;
  skipped_count: number;
  total_requested: number;
  errors?: Array<{
    subject_id: number;
    subject_name?: string;
    error: string;
  }>;
}