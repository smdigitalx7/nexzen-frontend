export interface SchoolClassSubjectCreate {
  class_id: number;
  subject_id: number;
}

export interface SchoolClassSubjectUpdate {
  class_id?: number;
  subject_id?: number;
}

export interface SchoolClassSubjectRead {
  class_id: number;
  subject_id: number;
  created_by?: number | null;
  updated_by?: number | null;
}


