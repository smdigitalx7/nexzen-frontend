export type SchoolStudentStatusEnum = "ACTIVE" | "INACTIVE" | "ALUMNI" | string;

export interface SchoolStudentCreate {
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
  admission_date?: string | null;
  status?: SchoolStudentStatusEnum | null;
}

export interface SchoolStudentUpdate extends Partial<SchoolStudentCreate> {}

export interface SchoolStudentRead {
  student_id: number;
  admission_no: string;
  student_name: string;
  aadhar_no?: string | null;
  gender?: string | null;
  dob?: string | null;
  present_address?: string | null;
  admission_date?: string | null;
  father_mobile?: string | null;
  mother_mobile?: string | null;
  status?: string | null;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface SchoolStudentFullDetails extends SchoolStudentRead {
  permanent_address?: string | null;
  father_name?: string | null;
  father_aadhar_no?: string | null;
  father_occupation?: string | null;
  mother_name?: string | null;
  mother_aadhar_no?: string | null;
  mother_mobile?: string | null;
  mother_occupation?: string | null;
}

export interface SchoolStudentsPaginatedResponse {
  data?: SchoolStudentRead[] | null;
  total_pages: number;
  current_page: number;
  page_size?: number | null;
}


