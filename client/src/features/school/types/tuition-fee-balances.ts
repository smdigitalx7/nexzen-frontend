export interface SchoolTuitionFeeBalanceCreate {
  enrollment_id: number;
  book_fee?: number | null;
  book_paid?: number | null;
  book_paid_status?: string | null;
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

export interface SchoolTuitionFeeBalanceUpdate {
  book_fee?: number;
  book_paid?: number;
  book_paid_status?: string;
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

export interface SchoolTuitionFeeBalanceRead {
  enrollment_id: number;
  admission_no: string;
  roll_number: string;
  student_name: string;
  section_name: string;
  class_name?: string;
  book_fee: number;
  book_paid: number;
  book_paid_status: string;
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

export interface SchoolTuitionPaginatedResponse {
  data?: SchoolTuitionFeeBalanceRead[] | null;
  total_pages?: number | null;
  current_page: number;
  page_size?: number | null;
  total_count?: number | null;
}

export interface SchoolTuitionFeeBalanceFullRead extends SchoolTuitionFeeBalanceRead {
  student_id: number;
  class_name: string;
  father_name: string;
  phone_number: string;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface SchoolTermPaymentUpdate {
  term_id: 1 | 2 | 3;
  amount: number;
}

export interface SchoolBookFeePaymentUpdate {
  amount: number;
}

export interface SchoolTuitionBalanceBulkCreate {
  class_id: number;
}

export interface SchoolTuitionBalanceBulkCreateResult {
  created_count: number;
  skipped_enrollment_ids: number[];
  total_requested: number;
}

export interface SchoolTuitionUnpaidTermsRow {
  student_name: string;
  admission_no: string;
  class_name: string;
  section_name?: string | null;
  roll_number: string;
  father_mobile?: string | null;
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

export interface SchoolTuitionUnpaidTermsResponse {
  data: SchoolTuitionUnpaidTermsRow[];
  total_pages?: number | null;
  current_page?: number | null;
  page_size?: number | null;
  total_count?: number | null;
}

// Dashboard schemas
export interface SchoolTuitionFeeBalanceDashboardStats {
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


