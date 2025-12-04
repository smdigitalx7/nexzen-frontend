export interface SchoolExamCreate {
  exam_name: string;
  weight_percentage: number; // 0.01-100
  pass_marks: number;
  max_marks: number;
  is_active?: boolean; // Optional, default: true
}

export interface SchoolExamUpdate {
  exam_name?: string;
  weight_percentage?: number; // 0.01-100
  pass_marks?: number;
  max_marks?: number;
  is_active?: boolean;
}

export interface SchoolExamRead {
  exam_id: number;
  exam_name: string;
  weight_percentage: number;
  pass_marks: number;
  max_marks: number;
  is_active: boolean;
  created_by?: number | null;
  updated_by?: number | null;
}

// Exam with optional schedule (for list/get endpoints with include_schedule=true)
export interface SchoolExamWithScheduleRead extends SchoolExamRead {
  exam_date?: string | null; // Optional date from exam schedule
}

// Exam Schedule Types
export interface ExamScheduleCreate {
  exam_id: number;
  academic_year_id: number;
  exam_date: string; // YYYY-MM-DD
}

export interface ExamScheduleUpdate {
  exam_date: string; // YYYY-MM-DD
}

export interface ExamScheduleRead {
  exam_id: number;
  academic_year_id: number;
  exam_date: string; // YYYY-MM-DD
  branch_id: number;
}


