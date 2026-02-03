export interface CollegePromotionEligibility {
  enrollment_id: number;
  student_id: number;
  admission_no: string;
  student_name: string;
  branch_id: number;
  institute_id: number;
  current_academic_year_id: number;
  current_academic_year_name: string;
  current_class_id: number;
  current_class_name: string;
  current_class_order: number;
  group_id: number;
  group_name: string;
  course_id: number | null;
  course_name: string | null;
  next_class_id: number;
  next_class_name: string;
  next_class_status: string;
  book_fee_total: number;
  book_fee_paid: number;
  book_fee_remaining: number;
  tuition_fee_total: number;
  tuition_fee_paid: number;
  tuition_fee_remaining: number;
  has_transport: boolean;
  transport_unpaid_months: number | null;
  total_pending_amount: number;
  is_promotable: boolean;
  pending_fee_types: string | null;
}

export interface CollegePromotionEligibilityResponse {
  eligibility: CollegePromotionEligibility[];
  total_count: number;
}

// Reuse PromotionRequest, PromotionResult, PromotionResponse, DropoutRequest, DropoutResponse
// since they have the same shape as school (as per documentation)
export interface PromotionRequest {
  next_academic_year_id: number;
  require_fees_paid?: boolean;
  transfer_requests?: {
    enrollment_id: number;
    transfer_type: "PROMOTION" | "SKIPPED";
  }[];
}

export interface PromotionResult {
  enrollment_id: number | null;
  student_id: number | null;
  admission_no: string | null;
  student_name: string | null;
  class_id: number | null;
  class_name: string | null;
  action_taken: "PROMOTED" | "SKIPPED" | "SUMMARY" | "ERROR";
  message: string;
  success: boolean;
}

export interface PromotionResponse {
  results: PromotionResult[];
}

export interface DropoutRequest {
  enrollment_id: number;
}

export interface DropoutResponse {
  enrollment_id: number;
  student_id: number;
  admission_no: string;
  student_name: string;
  action_taken: "DROPPED_OUT" | "ERROR";
  message: string;
  success: boolean;
}
