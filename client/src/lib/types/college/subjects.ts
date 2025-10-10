export interface CollegeSubjectResponse {
  subject_id: number;
  subject_name: string;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface CollegeSubjectList {
  subject_id: number;
  subject_name: string;
}

export interface CollegeCreateSubject {
  subject_name: string;
}

export interface CollegeUpdateSubject {
  subject_name?: string;
}


