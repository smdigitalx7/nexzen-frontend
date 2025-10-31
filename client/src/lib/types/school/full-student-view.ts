/**
 * School Full Student View Types
 * Matches backend schema: app/schemas/school/full_student_view.py
 */

export interface StudentDetails {
  student_id: number;
  admission_no: string;
  student_name: string;
  roll_number: string | null;
  class_id: number;
  class_name: string;
  section_id: number | null;
  section_name: string | null;
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

export interface TuitionFeeBalanceSummary {
  book_fee: number;
  book_paid: number;
  book_paid_status: string;
  actual_fee: number;
  concession_amount: number;
  total_fee: number;
  term1: TermBalance;
  term2: TermBalance;
  term3: TermBalance;
  overall_balance: number;
}

export interface TransportFeeBalanceSummary {
  transport_assignment_id: number;
  actual_fee: number;
  concession_amount: number;
  total_fee: number;
  term1: TermBalance;
  term2: TermBalance;
  overall_balance: number;
}

export interface TransportAssignment {
  transport_assignment_id: number;
  bus_route_id: number | null;
  route_name: string | null;
  route_no: string | null;
  vehicle_number: string | null;
  distance_slab_id: number | null;
  slab_name: string | null;
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

export interface SchoolFullStudentRead {
  admission_no: string;
  academic_year_id: number;
  branch_id: number;
  student_details: StudentDetails;
  transport_assignment: TransportAssignment | null;
  tuition_fee_balance_summary: TuitionFeeBalanceSummary | null;
  transport_fee_balance_summary: TransportFeeBalanceSummary | null;
  income_receipts_list: IncomeReceipt[];
}

