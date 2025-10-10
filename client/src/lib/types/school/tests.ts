export interface SchoolTestCreate {
  test_name: string;
  test_date: string; // YYYY-MM-DD
  pass_marks: number;
  max_marks: number;
}

export interface SchoolTestUpdate {
  test_name?: string;
  test_date?: string; // YYYY-MM-DD
  pass_marks?: number;
  max_marks?: number;
}

export interface SchoolTestRead {
  test_id: number;
  test_name: string;
  test_date: string; // YYYY-MM-DD
  pass_marks: number;
  max_marks: number;
  created_by?: number | null;
  updated_by?: number | null;
}


