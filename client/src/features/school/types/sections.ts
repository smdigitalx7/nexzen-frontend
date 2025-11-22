export interface SchoolSectionCreate {
  section_name: string;
  current_enrollment: number;
  is_active?: boolean;
}

export interface SchoolSectionUpdate {
  section_name?: string;
  current_enrollment?: number;
  is_active?: boolean;
}

export interface SchoolSectionRead {
  section_id: number;
  class_id: number;
  section_name: string;
  current_enrollment: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}


