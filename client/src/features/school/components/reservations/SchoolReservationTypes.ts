/**
 * Shared types and initial state for School Reservation Management.
 * Extracted for maintainability; no behavior change.
 */

export type ReservationFormState = {
  student_name: string;
  aadhar_no: string;
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
  previous_class: string;
  previous_school_details: string;
  present_address: string;
  permanent_address: string;
  application_fee: string;
  application_fee_paid: boolean;
  class_name: string;
  preferred_class_id: string;
  tuition_fee: string;
  book_fee: string;
  transport_required: boolean;
  preferred_transport_id: string;
  preferred_distance_slab_id: string;
  pickup_point: string;
  transport_fee: string;
  status: string;
  request_type: string;
  referred_by: string;
  other_referee_name: string;
  remarks: string;
  reservation_date: string;
};

export const initialFormState: ReservationFormState = {
  student_name: "",
  aadhar_no: "",
  gender: "",
  dob: "",
  father_or_guardian_name: "",
  father_or_guardian_aadhar_no: "",
  father_or_guardian_mobile: "",
  father_or_guardian_occupation: "",
  mother_or_guardian_name: "",
  mother_or_guardian_aadhar_no: "",
  mother_or_guardian_mobile: "",
  mother_or_guardian_occupation: "",
  siblings: [],
  previous_class: "",
  previous_school_details: "",
  present_address: "",
  permanent_address: "",
  application_fee: "0",
  application_fee_paid: false,
  class_name: "",
  preferred_class_id: "0",
  tuition_fee: "0",
  book_fee: "0",
  transport_required: false,
  preferred_transport_id: "0",
  preferred_distance_slab_id: "0",
  pickup_point: "",
  transport_fee: "0",
  status: "PENDING",
  request_type: "WALK_IN",
  referred_by: "",
  other_referee_name: "",
  remarks: "",
  reservation_date: "",
};
