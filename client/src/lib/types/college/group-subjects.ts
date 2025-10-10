export interface CollegeGroupSubjectCreate {
  group_id: number;
  subject_id: number;
  is_mandatory?: boolean;
}

export interface CollegeGroupSubjectUpdate {
  is_mandatory?: boolean;
}

export interface CollegeGroupSubjectRead {
  group_id: number;
  subject_id: number;
  branch_id: number;
  is_mandatory: boolean;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface CollegeGroupSubjectListResponse {
  data: CollegeGroupSubjectRead[];
  total: number;
  pages: number;
  current_page: number;
}


