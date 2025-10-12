export interface CollegeTuitionFeeBalanceCreate {
  enrollment_id: number;
  book_fee?: number | null;
  book_paid?: number | null;
  book_paid_status?: string | null; // PENDING/PAID
  group_fee: number;
  course_fee: number;
  actual_fee: number;
  concession_amount?: number | null;
  total_fee: number;
  term1_amount: number;
  term1_paid?: number | null;
  term1_balance: number;
  term2_amount: number;
  term2_paid?: number | null;
  term2_balance: number;
  term3_amount: number;
  term3_paid?: number | null;
  term3_balance: number;
  overall_balance_fee: number;
  term1_status?: string | null;
  term2_status?: string | null;
  term3_status?: string | null;
}

export interface CollegeTuitionFeeBalanceUpdate {
  book_fee?: number;
  book_paid?: number;
  book_paid_status?: string;
  group_fee?: number;
  course_fee?: number;
  actual_fee?: number;
  concession_amount?: number;
  total_fee?: number;
  term1_amount?: number;
  term1_paid?: number;
  term1_balance?: number;
  term2_amount?: number;
  term2_paid?: number;
  term2_balance?: number;
  term3_amount?: number;
  term3_paid?: number;
  term3_balance?: number;
  overall_balance_fee?: number;
  term1_status?: string;
  term2_status?: string;
  term3_status?: string;
}

export interface CollegeTuitionFeeBalanceRead {
  admission_no: string;
  roll_number: string;
  student_name: string;
  course_name: string;
  book_fee: number;
  book_paid: number;
  book_paid_status: string;
  group_fee: number;
  course_fee: number;
  actual_fee: number;
  concession_amount: number;
  total_fee: number;
  term1_amount: number;
  term1_paid: number;
  term1_balance: number;
  term2_amount: number;
  term2_paid: number;
  term2_balance: number;
  term3_amount: number;
  term3_paid: number;
  term3_balance: number;
  term1_status: string;
  term2_status: string;
  term3_status: string;
  overall_balance_fee: number;
}

export interface CollegeTuitionPaginatedResponse {
  data?: CollegeTuitionFeeBalanceRead[] | null;
  total_pages?: number | null;
  current_page: number;
  page_size?: number | null;
  total_count?: number | null;
}

export interface CollegeTuitionFeeBalanceFullRead extends CollegeTuitionFeeBalanceRead {
  enrollment_id: number;
  student_id: number;
  class_name: string;
  group_name: string;
  father_name: string;
  phone_number: string;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface CollegeTermPaymentUpdate {
  term_id: 1 | 2 | 3;
  amount: number;
}

export interface CollegeBookFeePaymentUpdate {
  amount: number;
}

export interface CollegeTuitionBalanceBulkCreate {
  class_id: number;
  group_id?: number | null;
  course_id?: number | null;
}

export interface CollegeTuitionBalanceBulkCreateResult {
  created_count: number;
  skipped_enrollment_ids: number[];
  total_requested: number;
}

export interface CollegeTuitionUnpaidTermsRow {
  student_name: string;
  admission_no: string;
  class_name: string;
  group_name: string;
  course_name: string;
  roll_number: string;
  father_mobile?: string | null;
  book_fee: number;
  book_paid: number;
  book_paid_status: string;
  term1_amount: number;
  term1_paid: number;
  term1_balance: number;
  term1_status: string;
  term2_amount: number;
  term2_paid: number;
  term2_balance: number;
  term2_status: string;
  term3_amount: number;
  term3_paid: number;
  term3_balance: number;
  term3_status: string;
}

export interface CollegeTuitionUnpaidTermsResponse {
  data: CollegeTuitionUnpaidTermsRow[];
  total_pages?: number | null;
  current_page?: number | null;
  page_size?: number | null;
  total_count?: number | null;
}

export interface CollegeTuitionFeeBalanceDashboardStats {
  total_balances: number;
  total_actual_fee: number;
  total_concession: number;
  total_net_fee: number;
  total_paid: number;
  total_outstanding: number;
  total_book_fee: number;
  total_book_paid: number;
  book_pending_count: number;
  book_paid_count: number;
  book_partial_count: number;
  term1_pending_count: number;
  term1_paid_count: number;
  term1_partial_count: number;
  term2_pending_count: number;
  term2_paid_count: number;
  term2_partial_count: number;
  term3_pending_count: number;
  term3_paid_count: number;
  term3_partial_count: number;
  average_payment_completion: number;
}

