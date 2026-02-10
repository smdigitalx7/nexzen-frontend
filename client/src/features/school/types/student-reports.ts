export interface CumulativeReportStudent {
  enrollment_id: number;
  student_id: number;
  student_name: string;
  class_id: number;
  class_name: string;
  section_id: number;
  section_name: string;
  roll_number: string;
  branch_id: number;
  academic_year_id: number;
}

export interface CumulativeReportAttendanceMonth {
  attendance_year: number;
  attendance_month: number;
  total_working_days: number;
  present_days: number;
  absent_days: number;
  attendance_percentage: number;
  status: string;
}

export interface CumulativeReportAttendance {
  total_working_days: number;
  present_days: number;
  absent_days: number;
  attendance_percentage: number;
  monthly: CumulativeReportAttendanceMonth[];
}

export interface CumulativeReportExam {
  exam_id: number;
  exam_name: string;
  weight_percentage: number;
  total_marks_obtained: number;
  total_max_marks: number;
  exam_percentage: number;
  weighted_contribution: number;
}

export interface CumulativeReportSubjectExam {
  exam_id: number;
  exam_name: string;
  weight_percentage: number;
  max_marks: number;
  marks_obtained: number;
  exam_percentage: number;
  weighted_contribution: number;
}

export interface CumulativeReportSubject {
  subject_id: number;
  subject_name: string;
  total_marks_obtained: number;
  total_max_marks: number;
  subject_percentage: number;
  subject_grade: string;
  exams: CumulativeReportSubjectExam[];
}

export interface CumulativeReportResponse {
  success: boolean;
  message: string;
  student: CumulativeReportStudent;
  attendance: CumulativeReportAttendance;
  exams: CumulativeReportExam[];
  subjects: CumulativeReportSubject[];
  final_overall_percentage: number;
  final_overall_grade: string;
}
