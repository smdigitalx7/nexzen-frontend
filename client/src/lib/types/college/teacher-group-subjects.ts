export interface CollegeTeacherGroupSubjectCreate {
  academic_year_id: number;
  teacher_id: number;
  class_id: number;
  group_id: number;
  subject_id: number;
  is_active?: boolean;
}

export interface CollegeTeacherGroupSubjectUpdate {
  is_active?: boolean;
}

export interface CollegeTeacherGroupSubjectRead {
  branch_id: number;
  academic_year_id: number;
  teacher_id: number;
  class_id: number;
  group_id: number;
  subject_id: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface CollegeTeacherGroupSubjectListResponse {
  data: CollegeTeacherGroupSubjectRead[];
  total: number;
  pages: number;
  current_page: number;
}


