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
  student_name: string;
  roll_number: string;
  section_name: string;
  marks_obtained: number | null;
  percentage: number | null;
  grade: string | null;
  remarks: string | null;
  conducted_at: string | null;
}

export interface CollegeExamGroupAndClassResponse {
  exam_id: number;
  exam_name: string;
  conducted_at: string;
  subject_id: number;
  subject_name: string;
  students: CollegeExamMarkMinimalRead[] | null;
}

export interface CollegeExamMarkFullReadResponse {
  mark_id: number;
  enrollment_id: number;
  student_name: string;
  roll_number: string;
  class_name: string;
  section_name: string;
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
  section_id?: number;
  exam_id: number;
  subject_id: number;
  conducted_at: string;
}

export interface CollegeExamMarkBulkCreateResult {
  created_count: number;
  skipped_enrollment_ids: number[];
  total_requested: number;
}


