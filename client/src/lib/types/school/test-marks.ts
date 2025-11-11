// Test Marks Types

// Base types matching backend schemas
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
export interface CreateTestMarkBulk {
  class_id: number;
  section_id?: number;
  test_id: number;
  subject_id: number;
  conducted_at: string;
}

export interface TestMarkBulkCreateResult {
  created_count: number;
  skipped_enrollment_ids: number[];
  total_requested: number;
}

// Query parameters - matching backend requirements
export interface TestMarksQuery {
  class_id: number; // Required
  subject_id: number; // Required
  test_id: number; // Required
  section_id?: number;
}
