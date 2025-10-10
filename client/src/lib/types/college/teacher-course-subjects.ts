export interface CollegeTeacherCourseSubjectCreate {
  academic_year_id: number;
  teacher_id: number;
  course_id: number;
  subject_id: number;
  is_active?: boolean;
}

export interface CollegeTeacherCourseSubjectUpdate {
  is_active?: boolean;
}

export interface CollegeTeacherCourseSubjectRead {
  branch_id: number;
  academic_year_id: number;
  teacher_id: number;
  course_id: number;
  subject_id: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface CollegeTeacherCourseSubjectListResponse {
  data: CollegeTeacherCourseSubjectRead[];
  total: number;
  pages: number;
  current_page: number;
}


