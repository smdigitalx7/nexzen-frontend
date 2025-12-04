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
  page?: number; // Optional pagination - page number (starts from 1)
  page_size?: number; // Optional pagination - items per page (1-1000)
}

// Bulk multiple students types
export interface BulkMultipleStudentsTestSubject {
  subject_id: number;
  marks_obtained: number;
  remarks?: string;
  subject_name: string;
}

export interface BulkMultipleStudentsTestStudent {
  enrollment_id: number;
  student_name: string;
  subjects: BulkMultipleStudentsTestSubject[];
}

export interface CreateBulkMultipleStudentsTestRequest {
  test_id: number;
  students: BulkMultipleStudentsTestStudent[];
  test_name: string;
}

export interface BulkMultipleStudentsTestStudentResult {
  enrollment_id: number;
  student_name: string;
  success: boolean;
  message: string;
  created_count: number;
  skipped_count: number;
  total_requested: number;
  errors?: Record<string, unknown>[];
}

export interface BulkMultipleStudentsTestResponse {
  success: boolean;
  message: string;
  test_id: number;
  test_name: string;
  total_created: number;
  total_skipped: number;
  total_students: number;
  student_results: BulkMultipleStudentsTestStudentResult[];
}