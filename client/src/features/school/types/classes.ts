export interface SchoolClassCreate {
  class_name: string;
  book_fee: number;
  tuition_fee: number;
  class_order: number;
}

export interface SchoolClassUpdate {
  class_name?: string;
  book_fee?: number;
  tuition_fee?: number;
  class_order: number;
}

export interface SchoolClassRead {
  class_id: number;
  class_name: string;
  book_fee: number;
  tuition_fee: number;
  class_order: number;
  created_by?: number | null;
  updated_by?: number | null;
  subjects?: { subject_id: number; subject_name: string }[];
}


export interface SchoolClassWithSubjects extends SchoolClassRead {
  subjects: { subject_id: number; subject_name: string }[];
}


