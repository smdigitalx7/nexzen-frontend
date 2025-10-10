export interface CollegeCourseCreate {
  group_id: number;
  course_name: string;
  course_fee: number;
}

export interface CollegeCourseUpdate {
  course_name?: string;
  course_fee?: number;
}

export interface CollegeCourseList {
  course_id: number;
  course_name: string;
  course_fee: number;
}

export interface CollegeCourseResponse {
  course_id: number;
  course_name: string;
  course_fee: number;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}


