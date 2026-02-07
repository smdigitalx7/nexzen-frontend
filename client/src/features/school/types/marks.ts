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
  max_marks?: number;
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
  subject_id: number; // Required
  exam_id: number; // Required
  section_id?: number;
}

export interface TestMarksQuery {
  class_id: number; // Required
  subject_id: number; // Required
  test_id: number; // Required
  section_id?: number;
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

// Student Marks View Types (marks-view endpoint)
export interface ExamMarkDetail {
  exam_name: string;
  max_marks: number;
  pass_marks: number;
  marks_obtained: number;
  percentage: number;
  grade: string | null;
  remarks: string | null;
}

export interface TestMarkDetail {
  test_name: string;
  max_marks: number;
  pass_marks: number;
  marks_obtained: number;
  percentage: number;
  grade: string | null;
  remarks: string | null;
}

export interface SubjectMarksDetail {
  subject_name: string;
  exam_marks: ExamMarkDetail[];
  test_marks: TestMarkDetail[];
}

export interface StudentDetailsMarks {
  admission_no: string;
  roll_number: string | null;
  student_name: string;
  class_name: string;
  section_name: string | null;
  academic_year: string;
  branch_name: string;
  enrollment_status: boolean;
}

export interface StudentMarksResponse {
  student_details: StudentDetailsMarks;
  subjects: SubjectMarksDetail[];
}

// Student Performance View Types (performance-view endpoint)
export interface SubjectPerformanceDetail {
  subject_name: string;
  total_exams: number;
  total_tests: number;
  total_assessments: number;
  total_max_marks: number;
  total_marks_obtained: number;
  percentage: number;
}

export interface StudentPerformanceResponse {
  student_details: StudentDetailsMarks;
  subjects: SubjectPerformanceDetail[];
}

// Exam Marks Report Types (exam-marks-report endpoint)
export interface SubjectMark {
  subject_name: string;
  marks: string; // Marks obtained or 'NO RECORD'
}

export interface SchoolStudentReport {
  section_name: string;
  roll_no: string;
  name: string;
  subjects: SubjectMark[];
  overall_total_marks: number;
  overall_percentage: number;
  overall_grade: string | null;
}

export interface SubjectWiseOverallMarks {
  subject_name: string;
  overall_marks: number;
  average_percentage: number | null;
}

export interface SchoolExamMarksReportData {
  exam_name: string;
  max_marks: number;
  class_name: string;
  students: SchoolStudentReport[];
  subject_wise_overall_marks: SubjectWiseOverallMarks[];
}

// Test Marks Report Types (test-marks-report endpoint)
export interface SchoolTestMarksReportData {
  test_name: string;
  max_marks: number;
  class_name: string;
  students: SchoolStudentReport[];
  subject_wise_overall_marks: SubjectWiseOverallMarks[];
}

// Query parameters for reports
export interface ExamMarksReportQuery {
  class_id: number;
  exam_id: number;
  subject_id?: number;
  section_id?: number;
}

export interface TestMarksReportQuery {
  class_id: number;
  test_id: number;
  subject_id?: number;
  section_id?: number;
}