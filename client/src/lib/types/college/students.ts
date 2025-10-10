export type StudentStatusEnum = "ACTIVE" | "INACTIVE" | "ALUMNI" | string;

export interface CollegeStudentCreate {
  admission_date?: string | null;
  student_name: string;
  aadhar_no?: string | null;
  gender?: string | null;
  dob?: string | null;
  father_name?: string | null;
  father_aadhar_no?: string | null;
  father_mobile?: string | null;
  father_occupation?: string | null;
  mother_name?: string | null;
  mother_aadhar_no?: string | null;
  mother_mobile?: string | null;
  mother_occupation?: string | null;
  present_address?: string | null;
  permanent_address?: string | null;
  status?: StudentStatusEnum | null;
}

export interface CollegeStudentUpdate extends Partial<CollegeStudentCreate> {}

export interface CollegeStudentRead {
  student_id: number;
  admission_no: string;
  student_name: string;
  aadhar_no?: string | null;
  gender?: string | null;
  dob?: string | null;
  father_name?: string | null;
  mother_name?: string | null;
  father_mobile?: string | null;
  mother_mobile?: string | null;
  present_address?: string | null;
  admission_date?: string | null;
  status?: StudentStatusEnum | null;
  created_at: string;
  updated_at?: string | null;
}

export interface CollegeStudentFullDetails extends CollegeStudentRead {
  permanent_address?: string | null;
  father_aadhar_no?: string | null;
  father_occupation?: string | null;
  mother_aadhar_no?: string | null;
  mother_occupation?: string | null;
  created_by?: number | null;
  created_by_name?: string | null;
  updated_by?: number | null;
  updated_by_name?: string | null;
}

export interface CollegeStudentsPaginatedResponse {
  data?: CollegeStudentRead[] | null;
  total_count: number;
  total_pages: number;
  current_page: number;
  page_size?: number | null;
}


