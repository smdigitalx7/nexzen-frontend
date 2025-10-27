export interface SchoolTeacherClassSubjectCreate {
  teacher_id: number;
  class_id: number;
  subject_id: number;
  section_id: number;
  is_class_teacher?: boolean;
  is_active?: boolean;
}

export interface ClassTeacherCreate {
  teacher_id: number;
  class_id: number;
  section_id?: number;
}

export interface ClassTeacherDelete {
  class_id: number;
  section_id?: number;
}

export interface SchoolTeacherClassSubjectRead {
  id: number;
  teacher_id: number;
  teacher_name: string;
  class_id: number;
  class_name: string;
  subject_id: number;
  subject_name: string;
  section_id: number;
  section_name: string;
  is_class_teacher: boolean;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

// Hierarchical types for the hierarchical endpoint
export interface SchoolSubjectDetail {
  subject_id: number;
  subject_name: string;
  is_class_teacher: boolean;
  is_active: boolean;
}

export interface SchoolSectionDetail {
  section_id: number;
  section_name: string;
  subjects: SchoolSubjectDetail[];
}

export interface SchoolClassDetail {
  class_id: number;
  class_name: string;
  sections: SchoolSectionDetail[];
}

export interface SchoolTeacherDetail {
  employee_id: number;
  teacher_name: string;
  classes: SchoolClassDetail[];
}


