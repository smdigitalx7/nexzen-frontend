export interface SchoolTransportFeeBalanceCreate {
  transport_assignment_id: number;
  enrollment_id: number;
  actual_fee: number;
  concession_amount?: number | null;
  total_fee: number;
  term1_amount: number;
  term1_paid?: number | null;
  term1_balance: number;
  term2_amount: number;
  term2_paid?: number | null;
  term2_balance: number;
  overall_balance_fee: number;
  overpayment_balance?: number | null;
  term1_status?: string | null;
  term2_status?: string | null;
}

export interface SchoolTransportFeeBalanceUpdate {
  actual_fee?: number;
  concession_amount?: number;
  total_fee?: number;
  term1_amount?: number;
  term1_paid?: number;
  term1_balance?: number;
  term2_amount?: number;
  term2_paid?: number;
  term2_balance?: number;
  overall_balance_fee?: number;
  overpayment_balance?: number;
  term1_status?: string;
  term2_status?: string;
}

export interface SchoolTransportFeeBalanceListRead {
  enrollment_id: number;
  admission_no: string;
  roll_number: string;
  student_name: string;
  section_name?: string | null;
  actual_fee: number;
  concession_amount: number;
  total_fee: number;
  term1_amount: number;
  term1_paid: number;
  term1_balance: number;
  term2_amount: number;
  term2_paid: number;
  term2_balance: number;
  term1_status: string;
  term2_status: string;
  overall_balance_fee: number;
}

export interface SchoolTransportFeeBalanceFullRead extends SchoolTransportFeeBalanceListRead {
  student_id: number;
  class_name?: string | null;
  father_name?: string | null;
  phone_number?: string | null;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface SchoolTransportPaginatedResponse {
  data?: SchoolTransportFeeBalanceListRead[] | null;
  total_pages?: number | null;
  current_page: number;
  page_size?: number | null;
  total_count?: number | null;
}

export interface SchoolTransportTermPaymentUpdate {
  term_id: 1 | 2;
  amount: number;
}

export interface SchoolTransportBalanceBulkCreate {
  class_id: number;
}

export interface SchoolTransportBalanceBulkCreateResult {
  created_count: number;
  skipped_enrollment_ids: number[];
  total_requested: number;
}

// Dashboard schemas
export interface SchoolTransportFeeBalanceDashboardStats {
  total_balances: number;
  total_actual_fee: number;
  total_concession: number;
  total_net_fee: number;
  total_paid: number;
  total_outstanding: number;
  term1_pending_count: number;
  term1_paid_count: number;
  term1_partial_count: number;
  term2_pending_count: number;
  term2_paid_count: number;
  term2_partial_count: number;
  average_payment_completion: number;
}


