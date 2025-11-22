export interface CollegeExamResponse {
  exam_id: number;
  exam_name: string;
  exam_date: string; // ISO datetime
  pass_marks: number;
  max_marks: number;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface CollegeExamRead {
  exam_id: number;
  exam_name: string;
  exam_date: string; // ISO
  pass_marks: number;
  max_marks: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CollegeExamCreate {
  exam_name: string;
  exam_date: string; // ISO
  pass_marks: number;
  max_marks: number;
}

export interface CollegeExamUpdate {
  exam_name?: string;
  exam_date?: string; // ISO
  pass_marks?: number;
  max_marks?: number;
}


