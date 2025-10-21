// College Admissions Types

export interface CollegeAdmissionListItem {
  student_id: number;
  admission_no: string;
  admission_date: string;
  student_name: string;
  group_name: string;
  course_name: string;
  admission_fee_paid: string;
  payable_tuition_fee: string;
  payable_transport_fee: string;
}

export interface CollegeAdmissionDetails {
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
  present_address: string;
  permanent_address: string;
  group_name: string;
  course_name: string;
  semester: string;
  admission_fee: string;
  admission_fee_paid: string;
  tuition_fee: string;
  tuition_concession: string | null;
  payable_tuition_fee: string;
  transport_required: string;
  route_: string;
  slab: string;
  transport_fee: string;
  transport_concession: string;
  payable_transport_fee: string;
  status: string;
  referred_by_name: string;
}
