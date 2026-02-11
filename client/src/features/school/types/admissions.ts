// School Admissions Types

export interface SchoolAdmissionListItem {
  student_id: number;
  admission_no: string;
  admission_date: string;
  student_name: string;
  class_name: string;
  admission_fee_paid: string;
  payable_tuition_fee: string;
  payable_transport_fee: string;
}

// ✅ FIX: API may return either a direct array or a paginated object
export type SchoolAdmissionsPaginatedResponse = 
  | SchoolAdmissionListItem[] // Direct array response
  | {
      data?: SchoolAdmissionListItem[] | null;
      admissions?: SchoolAdmissionListItem[] | null; // API may return 'admissions' instead of 'data'
      total_pages: number;
      current_page: number;
      page_size?: number | null;
      total_count?: number | null;
    };

export interface SchoolAdmissionDetails {
  student_id: number;
  branch_name: string;
  admission_no: string;
  admission_date: string;
  academic_year: string;
  student_name: string;
  gender: string;
  dob: string;
  father_or_guardian_name: string;
  father_or_guardian_aadhar_no: string;
  father_or_guardian_mobile: string;
  father_or_guardian_occupation: string;
  mother_or_guardian_name: string;
  mother_or_guardian_aadhar_no: string;
  mother_or_guardian_mobile: string;
  mother_or_guardian_occupation: string;
  siblings: Array<{
    name: string;
    class_name: string;
    where: string;
    gender: string;
  }>;
  present_address: string;
  permanent_address: string;
  class_name: string;
  book_fee: string;
  tuition_fee: string;
  tuition_concession: string | null;
  payable_tuition_fee: string;
  admission_fee: string;
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

