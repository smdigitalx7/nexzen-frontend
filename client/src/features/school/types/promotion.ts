export interface SchoolPromotionEligibility {
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
  next_class_id: number;
  next_class_name: string;
  next_class_status: string;
  book_fee_total: number;
  book_fee_paid: number;
  book_fee_remaining: number;
  tuition_fee_total: number;
  tuition_fee_paid: number;
  tuition_fee_remaining: number;
  transport_fee_total: number | null;
  transport_fee_paid: number | null;
  transport_fee_remaining: number | null;
  total_pending_amount: number;
  is_promotable: boolean;
  pending_fee_types: string | null;
}

export interface SchoolPromotionEligibilityResponse {
  eligibility: SchoolPromotionEligibility[];
  total_count: number;
}

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
  summary: {
    promoted: number;
    skipped: number;
    errors: number;
    message: string | null;
  };
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

/** GET /school/enrollments/promoted-students response (paginated) */
export interface SchoolPromotedStudentsResponse {
  items: Array<Record<string, unknown>>;
  total_count: number;
  current_page: number;
  page_size: number;
  total_pages: number;
}

/** GET /school/enrollments/dropped-out-students response (paginated) */
export interface SchoolDroppedOutStudentsResponse {
  items: Array<Record<string, unknown>>;
  total_count: number;
  current_page: number;
  page_size: number;
  total_pages: number;
}
