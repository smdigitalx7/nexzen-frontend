export type SchoolGenderEnum = "MALE" | "FEMALE" | "OTHER" | string;
export type SchoolReservationStatusEnum = "PENDING" | "CONFIRMED" | "CANCELLED" | string;

export interface SchoolReservationSibling {
  name?: string | null;
  class_name?: string | null;
  where?: string | null;
  gender?: SchoolGenderEnum | null;
  relation?: string | null;
}

export interface SchoolReservationCreate {
  student_name: string;
  aadhar_no?: string | null;
  gender: SchoolGenderEnum;
  dob?: string | null;
  father_name?: string | null;
  father_aadhar_no?: string | null;
  father_mobile?: string | null;
  father_occupation?: string | null;
  mother_name: string;
  mother_aadhar_no: string;
  mother_mobile: string;
  mother_occupation: string;
  siblings?: SchoolReservationSibling[] | null;
  previous_class?: string | null;
  previous_school_details?: string | null;
  present_address: string;
  permanent_address: string;
  reservation_fee: number;
  preferred_class_id: number;
  class_name?: string | null;
  tuition_fee: number;
  book_fee: number;
  tuition_concession?: number | null;
  preferred_transport_id?: number | null;
  preferred_distance_slab_id?: number | null;
  pickup_point?: string | null;
  transport_fee?: number | null;
  transport_concession?: number | null;
  status: SchoolReservationStatusEnum;
  referred_by?: number | null;
  remarks?: string | null;
  reservation_date?: string | null;
}

export interface SchoolReservationRead {
  reservation_id: number;
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
  siblings?: SchoolReservationSibling[] | null;
  previous_class?: string | null;
  previous_school_details?: string | null;
  present_address?: string | null;
  permanent_address?: string | null;
  reservation_fee?: number | null;
  preferred_class_id?: number | null;
  class_name?: string | null;
  tuition_fee: number;
  book_fee: number;
  tuition_concession?: number | null;
  preferred_transport_id?: number | null;
  preferred_distance_slab_id?: number | null;
  pickup_point?: string | null;
  transport_fee?: number | null;
  transport_concession?: number | null;
  status: SchoolReservationStatusEnum;
  referred_by?: number | null;
  remarks?: string | null;
  reservation_date?: string | null;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface SchoolReservationUpdate extends Partial<SchoolReservationCreate> {
  status: SchoolReservationStatusEnum;
}

export interface SchoolReservationListItem {
  reservation_id: number;
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
  siblings?: SchoolReservationSibling[] | null;
  previous_class?: string | null;
  previous_school_details?: string | null;
  present_address?: string | null;
  permanent_address?: string | null;
  admit_into?: string | null;
  admission_group?: string | null;
  reservation_fee?: number | null;
  preferred_class_id?: number | null;
  tuition_fee?: number | null;
  book_fee?: number | null;
  tuition_concession?: number | null;
  preferred_transport_id?: number | null;
  preferred_distance_slab_id?: number | null;
  transport_fee?: number | null;
  transport_concession?: number | null;
  status?: string | null;
  referred_by?: number | null;
  remarks?: string | null;
  reservation_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface SchoolReservationListResponse {
  reservations?: SchoolReservationListItem[] | null;
  current_page: number;
  page_size: number;
  total_pages: number;
  total_count: number;
}

// Dashboard and Recent schemas
export interface SchoolRecentReservation {
  reservation_id: number;
  student_name: string;
  aadhar_no?: string | null;
  preferred_class_id?: number | null;
  reservation_fee: number;
  status: string;
  reservation_date: string;
}

export interface SchoolReservationDashboardStats {
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

export interface SchoolReservationConcessionUpdate {
  transport_concession?: number | null;
  tuition_concession?: number | null;
  remarks?: string | null;
}


