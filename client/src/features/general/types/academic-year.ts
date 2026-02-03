export interface AcademicYearCreate {
  year_name: string;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  is_active?: boolean;
}

export interface AcademicYearUpdate {
  year_name?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

export interface AcademicYearRead {
  academic_year_id: number;
  year_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  status?: string;
  created_at: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}
