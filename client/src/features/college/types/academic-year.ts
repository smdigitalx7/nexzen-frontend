export interface CollegeAcademicYearCreate {
  year_name: string;
  start_date: string; // ISO date
  end_date: string; // ISO date
  is_active?: boolean;
}

export interface CollegeAcademicYearUpdate {
  year_name?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

export interface CollegeAcademicYearRead {
  academic_year_id: number;
  branch_id: number;
  year_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  status?: string;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface CollegeAcademicYearListResponse {
  data: CollegeAcademicYearRead[];
  total: number;
  pages: number;
  current_page: number;
}


