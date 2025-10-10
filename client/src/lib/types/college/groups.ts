export interface CollegeGroupCreate {
  group_name: string;
  book_fee: number;
  group_fee: number;
}

export interface CollegeGroupUpdate {
  group_name?: string;
  book_fee?: number;
  group_fee?: number;
}

export interface CollegeGroupList {
  group_id: number;
  group_name: string;
  book_fee: number;
  group_fee: number;
}

export interface CollegeGroupResponse {
  group_id: number;
  group_name: string;
  book_fee: number;
  group_fee: number;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}


