export interface SchoolTeacherClassSubjectCreate {
  teacher_id: number;
  class_id: number;
  subject_id: number;
}

export interface SchoolTeacherClassSubjectRead {
  id: number;
  teacher_id: number;
  class_id: number;
  subject_id: number;
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}


