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

export interface CollegeTransportFeeBalanceDashboardStats {
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

// Student Transport Payment Summary Types
export interface CollegeStudentTransportMonthlyPayment {
  payment_id: number | null;
  payment_month: string;
  amount_paid: number | string;
  payment_status: string;
  receipt_no: string | null;
  payment_created_at: string | null;
}

export interface CollegeStudentTransportExpectedPayment {
  expected_payment_month: string;
  payment_status: string;
}

export interface CollegeStudentTransportPaymentSummary {
  student_id: number;
  admission_no: string | null;
  student_name: string;
  branch_id: number;
  enrollment_id: number;
  academic_year_id: number;
  academic_year_name: string | null;
  class_id: number;
  class_name: string;
  group_id: number | null;
  group_name: string | null;
  course_id: number | null;
  course_name: string | null;
  roll_number: string | null;
  transport_assignment_id: number;
  bus_route_id: number;
  bus_route_name: string | null;
  bus_route_no: string | null;
  vehicle_number: string | null;
  pickup_point: string | null;
  transport_start_date: string;
  transport_end_date: string | null;
  transport_assignment_active: boolean;
  months_paid_count: number;
  months_pending_count: number;
  total_amount_paid: number | string;
  total_amount_pending: number | string;
  monthly_payments: CollegeStudentTransportMonthlyPayment[];
  expected_payments: CollegeStudentTransportExpectedPayment[];
  first_expected_payment_month: string;
  last_expected_payment_month: string;
  enrollment_active: boolean;
  student_status: string;
}

export interface CollegeStudentTransportPaymentSummaryListResponse {
  items: CollegeStudentTransportPaymentSummary[];
}

export interface CollegeStudentTransportPaymentSummaryParams {
  class_id?: number | null;
  group_id?: number | null;
  course_id?: number | null;
  bus_route_id?: number | null;
}

