// Marks Management Types

// Base types matching backend schemas
export interface ExamMarkCreate {
  enrollment_id: number;
  exam_id: number;
  subject_id: number;
  marks_obtained?: number | null;
  percentage?: number | null;
  grade?: string | null;
  remarks?: string | null;
  conducted_at?: string | null;
}

export interface ExamMarkUpdate {
  marks_obtained: number;
  percentage: number;
  grade: string;
  remarks: string;
  conducted_at: string;
}

export interface ExamMarkRead {
  mark_id: number;
  enrollment_id: number;
  exam_id: number;
  subject_id: number;
  marks_obtained?: number | null;
  percentage?: number | null;
  grade?: string | null;
  remarks?: string | null;
  conducted_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface TestMarkCreate {
  enrollment_id: number;
  test_id: number;
  subject_id: number;
  marks_obtained?: number | null;
  percentage?: number | null;
  grade?: string | null;
  remarks?: string | null;
  conducted_at?: string | null;
}

export interface TestMarkUpdate {
  marks_obtained: number;
  percentage: number;
  grade: string;
  remarks: string;
  conducted_at: string;
}

export interface TestMarkRead {
  test_mark_id: number;
  enrollment_id: number;
  test_id: number;
  subject_id: number;
  marks_obtained?: number | null;
  percentage?: number | null;
  grade?: string | null;
  remarks?: string | null;
  conducted_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

// Backend response types - matching actual API responses
export interface ExamMarkMinimalRead {
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

export interface ExamGroupAndSubjectResponse {
  exam_id: number;
  exam_name: string;
  conducted_at: string;
  subject_id: number;
  subject_name: string;
  students: ExamMarkMinimalRead[] | null;
}

export interface TestMarkMinimalRead {
  test_mark_id: number;
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

export interface TestGroupAndSubjectResponse {
  test_id: number;
  test_name: string;
  conducted_at: string;
  subject_id: number;
  subject_name: string;
  students: TestMarkMinimalRead[] | null;
}

export interface ExamMarkFullReadResponse {
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

export interface TestMarkFullReadResponse {
  test_mark_id: number;
  enrollment_id: number;
  student_name: string;
  roll_number: string;
  section_name: string;
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

// Extended types with related data for UI display (flattened from grouped response)
export interface ExamMarkWithDetails extends ExamMarkMinimalRead {
  class_name?: string;
  subject_name?: string;
  exam_name?: string;
  exam_date?: string;
  max_marks?: number;
  exam_id?: number;
  subject_id?: number;
}

export interface TestMarkWithDetails extends TestMarkMinimalRead {
  class_name?: string;
  subject_name?: string;
  test_name?: string;
  test_date?: string;
  max_marks?: number;
  test_id?: number;
  subject_id?: number;
}

// Bulk operations
export interface CreateExamMarkBulk {
  class_id: number;
  section_id?: number;
  exam_id: number;
  subject_id: number;
  conducted_at: string;
}

export interface CreateTestMarkBulk {
  class_id: number;
  section_id?: number;
  test_id: number;
  subject_id: number;
  conducted_at: string;
}

export interface ExamMarkBulkCreateResult {
  created_count: number;
  skipped_enrollment_ids: number[];
  total_requested: number;
}

export interface TestMarkBulkCreateResult {
  created_count: number;
  skipped_enrollment_ids: number[];
  total_requested: number;
}

// Multiple subjects operations
export interface SubjectMarkItem {
  subject_id: number;
  marks_obtained?: number | null;
  remarks?: string | null;
  subject_name?: string | null;
}

export interface CreateExamMarksMultipleSubjects {
  enrollment_id: number;
  exam_id: number;
  subjects: SubjectMarkItem[];
  student_name?: string | null;
  exam_name?: string | null;
}

export interface ExamMarksMultipleSubjectsResult {
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

// Test marks multiple subjects operations
export interface TestSubjectMarkItem {
  subject_id: number;
  marks_obtained?: number | null;
  remarks?: string | null;
  subject_name?: string | null;
}

export interface CreateTestMarksMultipleSubjects {
  enrollment_id: number;
  test_id: number;
  subjects: TestSubjectMarkItem[];
  student_name?: string | null;
  test_name?: string | null;
}

export interface TestMarksMultipleSubjectsResult {
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

// Query parameters - matching backend requirements
export interface ExamMarksQuery {
  class_id: number; // Required
  subject_id?: number;
  section_id?: number;
  exam_id?: number;
}

export interface TestMarksQuery {
  class_id: number; // Required
  subject_id?: number;
  section_id?: number;
  test_id: number; // Required
}

// Legacy query interface for backward compatibility
export interface MarksQuery {
  page?: number;
  page_size?: number;
  class_id?: number;
  section_id?: number;
  subject_id?: number;
  exam_id?: number;
  test_id?: number;
  enrollment_id?: number;
  start_date?: string;
  end_date?: string;
}
