// College Student Marks Types

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
  group_name: string | null;
  course_name: string | null;
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

export interface CollegeStudentReport {
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

export interface CollegeExamMarksReportData {
  exam_name: string;
  max_marks: number;
  class_name: string;
  students: CollegeStudentReport[];
  subject_wise_overall_marks: SubjectWiseOverallMarks[];
}

// Test Marks Report Types (test-marks-report endpoint)
export interface CollegeTestMarksReportData {
  test_name: string;
  max_marks: number;
  class_name: string;
  students: CollegeStudentReport[];
  subject_wise_overall_marks: SubjectWiseOverallMarks[];
}

// Query parameters for reports
export interface ExamMarksReportQuery {
  class_id: number;
  exam_id: number;
  course_id: number;
  subject_id?: number;
  group_id?: number;
}

export interface TestMarksReportQuery {
  class_id: number;
  test_id: number;
  course_id: number;
  subject_id?: number;
  group_id?: number;
}

