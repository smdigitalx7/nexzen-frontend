// College Admissions Types

export interface CollegeAdmissionListItem {
  student_id: number;
  admission_no: string | null;
  admission_date: string | null;
  student_name: string;
  group_name: string | null;
  course_name: string | null;
  admission_fee_paid: string;
  payable_tuition_fee: string | null;
  payable_transport_fee: string | null;
}

export interface CollegeAdmissionsPaginatedResponse {
  data?: CollegeAdmissionListItem[] | null;
  total_pages: number;
  current_page: number;
  page_size?: number | null;
  total_count?: number | null;
}

export interface CollegeAdmissionDetails {
  student_id: number;
  branch_name: string;
  admission_no: string | null;
  admission_date: string | null;
  academic_year: string | null;
  student_name: string;
  gender: string | null;
  dob: string | null;
  father_or_guardian_name: string | null;
  father_or_guardian_aadhar_no: string | null;
  father_or_guardian_mobile: string | null;
  father_or_guardian_occupation: string | null;
  mother_or_guardian_name: string | null;
  mother_or_guardian_aadhar_no: string | null;
  mother_or_guardian_mobile: string | null;
  mother_or_guardian_occupation: string | null;
  siblings: Array<{
    name: string;
    class_name: string;
    where: string;
    gender: string;
  }> | null;
  present_address: string | null;
  permanent_address: string | null;
  group_name: string | null;
  course_name: string | null;
  book_fee: number | null;
  group_fee: number | null;
  course_fee: number | null;
  total_tuition_fee: number | null;
  tuition_concession: number | null;
  payable_tuition_fee: string | null;
  admission_fee: number | null;
  admission_fee_paid: string;
  transport_required: string;
  route_: string;
  slab: string;
  transport_fee: string;
  transport_concession: string;
  payable_transport_fee: string;
  status: string;
  other_referee_name: string;
}
