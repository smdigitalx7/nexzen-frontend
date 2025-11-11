export type GenderEnum = "MALE" | "FEMALE" | "OTHER";
export type ReservationStatusEnum = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface CollegeReservationSibling {
  name?: string | null;
  class_name?: string | null;
  where?: string | null;
  gender?: GenderEnum | null;
}

export interface CollegeReservationCreate {
  student_name: string;
  aadhar_no?: string | null;
  gender: GenderEnum;
  dob?: string | null;
  father_or_guardian_name?: string | null;
  father_or_guardian_aadhar_no?: string | null;
  father_or_guardian_mobile?: string | null;
  father_or_guardian_occupation?: string | null;
  mother_or_guardian_name?: string | null;
  mother_or_guardian_aadhar_no?: string | null;
  mother_or_guardian_mobile?: string | null;
  mother_or_guardian_occupation?: string | null;
  siblings?: CollegeReservationSibling[] | null;
  previous_class?: string | null;
  previous_school_details?: string | null;
  present_address?: string | null;
  permanent_address?: string | null;
  application_fee?: number | null;
  reservation_fee?: number | null;
  preferred_class_id: number;
  preferred_group_id: number;
  group_name?: string | null;
  preferred_course_id: number;
  course_name?: string | null;
  group_fee?: number | null;
  course_fee?: number | null;
  book_fee?: number | null;
  total_tuition_fee?: number | null;
 
  application_fee_paid?: boolean | null;
  transport_required?: boolean | null;
  preferred_transport_id?: number | null;
  preferred_distance_slab_id?: number | null;
  pickup_point?: string | null;
  transport_fee?: number | null;
  concession_lock?: boolean | null;
  book_fee_required?: boolean | null;
  course_required?: boolean | null;
  status: ReservationStatusEnum;
  referred_by?: number | null;
  remarks?: string | null;
}

export interface CollegeReservationUpdate extends Partial<CollegeReservationCreate> {}

export interface CollegeReservationRead {
  reservation_id: number;
  reservation_no?: string | null;
  student_name: string;
  aadhar_no?: string | null;
  gender?: GenderEnum | null;
  dob?: string | null;
  father_or_guardian_name?: string | null;
  father_or_guardian_aadhar_no?: string | null;
  father_or_guardian_mobile?: string | null;
  father_or_guardian_occupation?: string | null;
  mother_or_guardian_name?: string | null;
  mother_or_guardian_aadhar_no?: string | null;
  mother_or_guardian_mobile?: string | null;
  mother_or_guardian_occupation?: string | null;
  siblings?: CollegeReservationSibling[] | null;
  previous_class?: string | null;
  previous_school_details?: string | null;
  present_address?: string | null;
  permanent_address?: string | null;
  application_fee?: number | null;
  application_fee_paid?: boolean | null;
  preferred_class_id?: number | null;
  preferred_group_id?: number | null;
  group_name?: string | null;
  preferred_course_id?: number | null;
  course_name?: string | null;
  group_fee?: number | null;
  course_fee?: number | null;
  book_fee?: number | null;
  total_tuition_fee?: number | null;
  tuition_concession?: number | null;
  preferred_transport_id?: number | null;
  preferred_distance_slab_id?: number | null;
  pickup_point?: string | null;
  transport_fee?: number | null;
  transport_concession?: number | null;
  concession_lock?: boolean | null;
  book_fee_required?: boolean | null;
  course_required?: boolean | null;
  status: ReservationStatusEnum;
  referred_by?: number | null;
  referred_by_name?: string | null;
  remarks?: string | null;
  reservation_date?: string | null;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
  application_income_id?: number | null;
  admission_income_id?: number | null;
  is_enrolled?: boolean | null;
}

export interface CollegeReservationMinimalRead {
  reservation_id: number;
  reservation_no?: string | null;
  reservation_date?: string | null;
  student_name: string;
  gender?: GenderEnum | null;
  father_or_guardian_name?: string | null;
  father_or_guardian_mobile?: string | null;
  group_name?: string | null;
  course_name?: string | null;
  status: ReservationStatusEnum;
  application_fee_paid?: boolean | null;
  remarks?: string | null;
  application_income_id?: number | null;
  admission_income_id?: number | null;
  is_enrolled?: boolean | null;
}

export interface CollegePaginatedReservationRead {
  reservations: CollegeReservationMinimalRead[];
  total_count: number;
  current_page: number;
  page_size: number;
  total_pages: number;
}

// Dashboard and Recent schemas
export interface CollegeRecentReservation {
  reservation_id: number;
  student_name: string;
  aadhar_no?: string | null;
  group_name?: string | null;
  course_name?: string | null;
  reservation_fee?: number | null;
  status: ReservationStatusEnum;
  reservation_date?: string | null;
}

export interface CollegeReservationDashboardStats {
  total_reservations: number;
  pending_reservations: number;
  confirmed_reservations: number;
  cancelled_reservations: number;
  total_reservation_fees: number;
  total_tuition_fees: number;
  total_transport_fees: number;
  total_tuition_concessions: number;
  total_transport_concessions: number;
  reservations_this_month: number;
  reservations_this_year: number;
  male_students: number;
  female_students: number;
}

// Reservation View schema for detailed view endpoint
export interface CollegeReservationView {
  reservation_id: number;
  branch_name: string;
  reservation_no: string;
  reservation_date: string;
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
  siblings: CollegeReservationSibling[];
  present_address: string;
  permanent_address: string;
  application_fee: string;
  application_fee_paid: string;
  group_name: string;
  course_name: string;
  book_fee: string;
  group_fee: string;
  course_fee: string;
  total_tuition_fee: string;
  tuition_concession: string;
  payable_tuition_fee: string;
  transport_required: string;
  route_: string;
  slab: string;
  transport_fee: string;
  transport_concession: string;
  payable_transport_fee: string;
  status: string;
  referred_by_name: string;
  application_fee_income_id: number;
  created_at: string;
}