export interface CollegeTuitionFeeStructureCreate {
  class_id: number;
  book_fee?: number | null;
  group_fee: number;
  course_fee: number;
  total_annual_fee: number;
}

export interface CollegeTuitionFeeStructureUpdate {
  book_fee?: number | null;
  group_fee?: number;
  course_fee?: number;
  total_annual_fee?: number;
}

export interface CollegeTuitionFeeStructureRead {
  fee_structure_id: number;
  branch_id: number;
  class_id: number;
  book_fee: number;
  group_fee: number;
  course_fee: number;
  total_annual_fee: number;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface CollegeTuitionFeeStructureListResponse {
  data: CollegeTuitionFeeStructureRead[];
  total: number;
  pages: number;
  current_page: number;
}


