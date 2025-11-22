export interface CollegeTestResponse {
  test_id: number;
  test_name: string;
  test_date: string; // ISO datetime
  pass_marks: number;
  max_marks: number;
  created_at: string;
  updated_at: string | null;
  created_by: number | null;
  updated_by: number | null;
}

export interface CollegeTestRead {
  test_id: number;
  test_name: string;
  test_date: string; // ISO
  pass_marks: number;
  max_marks: number;
}

export interface CollegeTestCreate {
  test_name: string;
  test_date: string; // ISO
  pass_marks: number;
  max_marks: number;
}

export interface CollegeTestUpdate {
  test_name?: string;
  test_date?: string; // ISO
  pass_marks?: number;
  max_marks?: number;
}


