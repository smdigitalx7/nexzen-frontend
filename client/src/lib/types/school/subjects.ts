export interface SchoolSubjectCreate {
  subject_name: string;
}

export interface SchoolSubjectUpdate {
  subject_name?: string;
}

export interface SchoolSubjectRead {
  subject_id: number;
  subject_name: string;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface SchoolSubjectList {
  subject_id: number;
  subject_name: string;
}

export interface SchoolSubjectWithClasses extends SchoolSubjectRead {
  classes: { class_id: number; class_name: string }[];
}


