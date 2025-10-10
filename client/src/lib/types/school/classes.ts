export interface SchoolClassCreate {
  class_name: string;
}

export interface SchoolClassUpdate {
  class_name?: string;
}

export interface SchoolClassRead {
  class_id: number;
  class_name: string;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface SchoolClassWithSubjects extends SchoolClassRead {
  subjects: { subject_id: number; subject_name: string }[];
}


