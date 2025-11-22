export interface SchoolTuitionFeeStructureRead {
  fee_structure_id: number;
  class_id: number;
  book_fee: number;
  tuition_fee: number;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface SchoolTuitionFeeStructureCreate {
  class_id: number;
  book_fee: number;
  tuition_fee: number;
}

export interface SchoolTuitionFeeStructureUpdate {
  book_fee?: number;
  tuition_fee?: number;
}


