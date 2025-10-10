export interface CollegeClassGroupCreate {
  class_id: number;
  group_id: number;
}

export interface CollegeClassGroupDelete {
  class_id: number;
  group_id: number;
}

export interface CollegeClassGroupRead {
  class_id: number;
  group_id: number;
  branch_id: number;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface CollegeClassGroupListResponse {
  data: CollegeClassGroupRead[];
  total: number;
  pages: number;
  current_page: number;
}


