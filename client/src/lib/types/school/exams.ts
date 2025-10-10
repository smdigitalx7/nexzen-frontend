export interface SchoolExamCreate {
  exam_name: string;
  exam_date: string; // YYYY-MM-DD
  pass_marks: number;
  max_marks: number;
}

export interface SchoolExamUpdate {
  exam_name?: string;
  exam_date?: string; // YYYY-MM-DD
  pass_marks?: number;
  max_marks?: number;
}

export interface SchoolExamRead {
  exam_id: number;
  exam_name: string;
  exam_date: string; // YYYY-MM-DD
  pass_marks: number;
  max_marks: number;
  created_by?: number | null;
  updated_by?: number | null;
}


