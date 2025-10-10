export interface CollegeTransportFeeBalanceCreate {
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
  term1_status?: string | null; // PENDING/PAID
  term2_status?: string | null;
}

export interface CollegeTransportFeeBalanceUpdate {
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

export interface CollegeTransportFeeBalanceListRead {
  balance_id: number;
  enrollment_id: number;
  admission_no: string;
  roll_number: string;
  student_name: string;
  class_name?: string | null;
  group_name?: string | null;
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

export interface CollegeTransportFeeBalanceFullRead extends CollegeTransportFeeBalanceListRead {
  student_id: number;
  father_name?: string | null;
  phone_number?: string | null;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface CollegeTransportPaginatedResponse {
  data?: CollegeTransportFeeBalanceListRead[] | null;
  total_pages?: number | null;
  current_page: number;
  page_size?: number | null;
  total_count?: number | null;
}

export interface CollegeTransportTermPaymentUpdate {
  term_id: 1 | 2;
  amount: number;
}

export interface CollegeTransportBalanceBulkCreate {
  class_id: number;
  group_id: number;
}

export interface CollegeTransportBalanceBulkCreateResult {
  created_count: number;
  skipped_enrollment_ids: number[];
  total_requested: number;
}


