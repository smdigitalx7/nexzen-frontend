/**
 * College Full Student View Types
 * Matches backend schema: app/schemas/college/full_student_view.py
 */

export interface CollegeStudentDetails {
  student_id: number;
  admission_no: string;
  student_name: string;
  roll_number: string | null;
  class_id: number;
  class_name: string;
  group_id: number | null;
  group_name: string | null;
  course_id: number | null;
  course_name: string | null;
  academic_year_id: number;
  academic_year: string;
  branch_id: number;
  branch_name: string;
  enrollment_status: boolean;
  student_status: string;
}

export interface TermBalance {
  amount: number;
  paid: number;
  balance: number;
  status: string;
}

export interface CollegeTuitionFeeBalanceSummary {
  book_fee: number;
  book_paid: number;
  book_paid_status: string;
  group_fee: number;
  course_fee: number;
  actual_fee: number;
  concession_amount: number;
  total_fee: number;
  term1: TermBalance;
  term2: TermBalance;
  term3: TermBalance;
  overall_balance: number;
}

export interface MonthlyPayment {
  payment_id: number | null;
  payment_month: string;
  amount_paid: number;
  payment_status: string;
  receipt_no: string | null;
  payment_created_at: string | null;
}

export interface ExpectedPayment {
  expected_payment_month: string;
  payment_status: string;
}

export interface CollegeTransportFeeBalanceSummary {
  transport_assignment_id: number;
  months_paid_count: number;
  months_pending_count: number;
  total_amount_paid: number;
  total_amount_pending: number;
  monthly_payments: MonthlyPayment[];
  expected_payments: ExpectedPayment[];
  first_expected_payment_month: string;
  last_expected_payment_month: string;
}

export interface CollegeTransportAssignment {
  transport_assignment_id: number;
  bus_route_id: number | null;
  route_name: string | null;
  route_no: string | null;
  vehicle_number: string | null;
  slab_id?: number | null;
  slab_name?: string | null;
  pickup_point: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean | null;
}

export interface IncomeReceiptParticular {
  desc: string;
  amount: number;
}

export interface IncomeReceipt {
  income_id: number;
  receipt_no: string;
  total_amount: number;
  payment_date: string;
  payment_mode: string;
  purpose: string;
  particulars: IncomeReceiptParticular[];
  created_at: string;
}

export interface CollegeFullStudentRead {
  admission_no: string;
  academic_year_id: number;
  branch_id: number;
  student_details: CollegeStudentDetails;
  transport_assignment: CollegeTransportAssignment | null;
  tuition_fee_balance_summary: CollegeTuitionFeeBalanceSummary | null;
  transport_fee_balance_summary: CollegeTransportFeeBalanceSummary | null;
  income_receipts_list: IncomeReceipt[];
}

