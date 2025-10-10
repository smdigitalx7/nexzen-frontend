// College Management Types

export interface GroupRead {
  id: number;
  group_name: string;
  group_code: string;
  description: string;
  group_fee: number;
  active: boolean;
  students_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface GroupCreate {
  group_name: string;
  group_code: string;
  description: string;
  group_fee: number;
}

export interface GroupUpdate {
  group_name?: string;
  group_code?: string;
  description?: string;
  group_fee?: number;
  active?: boolean;
}

export interface CourseRead {
  id: number;
  course_name: string;
  course_code: string;
  description: string;
  course_fee: number;
  active: boolean;
  students_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface CourseCreate {
  course_name: string;
  course_code: string;
  description: string;
  course_fee: number;
}

export interface CourseUpdate {
  course_name?: string;
  course_code?: string;
  description?: string;
  course_fee?: number;
  active?: boolean;
}

export interface CombinationRead {
  id: number;
  group_id: number;
  course_id: number;
  combination_fee: number;
  active: boolean;
  students_count: number;
  group_name?: string;
  course_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CombinationCreate {
  group_id: number;
  course_id: number;
  combination_fee: number;
}

export interface CombinationUpdate {
  group_id?: number;
  course_id?: number;
  combination_fee?: number;
  active?: boolean;
}

export interface SectionRead {
  id: number;
  section_name: string;
  group_course_combination_id: number;
  max_capacity: number;
  academic_year: string;
  active: boolean;
  current_strength: number;
  group_name?: string;
  course_name?: string;
  combination_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SectionCreate {
  section_name: string;
  group_course_combination_id: number;
  max_capacity: number;
  academic_year: string;
}

export interface SectionUpdate {
  section_name?: string;
  group_course_combination_id?: number;
  max_capacity?: number;
  academic_year?: string;
  active?: boolean;
}

// API Response Types
export interface GroupListResponse {
  data: GroupRead[];
  total: number;
  pages: number;
  current_page: number;
}

export interface CourseListResponse {
  data: CourseRead[];
  total: number;
  pages: number;
  current_page: number;
}

export interface CombinationListResponse {
  data: CombinationRead[];
  total: number;
  pages: number;
  current_page: number;
}

export interface SectionListResponse {
  data: SectionRead[];
  total: number;
  pages: number;
  current_page: number;
}
