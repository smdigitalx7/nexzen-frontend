export interface CollegeIncomeCreate {
  enrollment_id?: number | null;
  purpose: string; // e.g., OTHER, TERM_FEE, etc.
  amount: number;
  income_date: string; // YYYY-MM-DD
  term_number?: number | null;
  payment_method?: string | null;
  note?: string | null;
}

export interface CollegeIncomeCreateReservation {
  reservation_id: number;
  purpose: string; // RESERVATION_FEE
  amount: number;
  income_date: string; // YYYY-MM-DD
  payment_method?: string | null;
  note?: string | null;
}

export interface CollegeIncomeUpdate {
  purpose?: string;
  amount?: number;
  income_date?: string; // YYYY-MM-DD
  term_number?: number | null;
  payment_method?: string | null;
  note?: string | null;
}

export interface CollegeIncomeRead {
  income_id: number;
  enrollment_id?: number | null;
  reservation_id?: number | null;
  admission_no?: string | null;
  roll_number?: string | null;
  student_name?: string | null;
  total_amount: number;
  receipt_no?: string | null;
  remarks?: string | null;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface CollegeRecentIncome {
  income_id: number;
  student_name?: string | null;
  admission_no?: string | null;
  purpose: string;
  amount: number;
  income_date: string;
}

export interface CollegeIncomeReceipt {
  academic_year: string;
  admission_no: string;
  reservation_no: string;
  student_name: string;
  father_or_guardian_name: string;
  receipt_no: string;
  father_or_guardian_mobile: string;
  payment_mode: string;
  date: string;
  particulars: Array<{
    desc: string;
    amount: number;
  }>;
  total_amount: number;
  receipt_type: string;
}

export interface CollegeIncomeDashboardStats {
  total_income_records: number;
  total_income_amount: number;
  tuition_fee_income: number;
  transport_fee_income: number;
  book_fee_income: number;
  /** API may return application_fee_income (reservation/application fees) */
  application_fee_income?: number;
  reservation_fee_income?: number;
  other_income: number;
  income_this_month: number;
  income_this_year: number;
  income_records_this_month: number;
  income_records_this_year: number;
}

// Finance Report Types
export interface CollegeFinanceReportIncomeItem {
  sNo: number;
  receipt_no: string;
  identity_no: string;
  student_name: string;
  purpose: string;
  payment_method: string;
  amount: number;
  created_by: string;
}

export interface CollegeFinanceReportExpenditureItem {
  sNo: number;
  expenditure_id: number;
  voucher_no: string;
  bill_date: string;
  purpose: string;
  amount: number;
  payment_method: string;
  created_by: string;
}

export interface CollegeFinanceReportIncomeObject {
  income_list: CollegeFinanceReportIncomeItem[];
  total_income: number;
  income_count: number;
}

export interface CollegeFinanceReportExpenditureObject {
  expenditure_list: CollegeFinanceReportExpenditureItem[];
  total_expenditure: number;
  expenditure_count: number;
}

export interface CollegeFinanceReport {
  branch_id: number;
  branch_name: string;
  branch_type: string;
  branch_address: string;
  branch_phone: string;
  branch_email: string;
  institute_name: string;
  report_date: string;
  income_object: CollegeFinanceReportIncomeObject;
  expenditure_object: CollegeFinanceReportExpenditureObject;
  total_income: number;
  total_expenditure: number;
  profit_loss: number;
  financial_status: string;
  generated_date: string;
  generated_at: string;
}

export interface CollegeFinanceReportParams {
  start_date?: string;
  end_date?: string;
}

// Income Summary Types
export interface CollegeIncomeSummary {
  income_id: number;
  branch_id: number;
  receipt_no: string;
  student_name: string;
  identity_no: string;
  total_amount: number;
  purpose: string;
  created_at: string;
}

export interface CollegeIncomeSummaryListResponse {
  data: CollegeIncomeSummary[];
  total_count: number;
  page: number;
  size: number;
}

export interface CollegeIncomeSummaryParams {
  page?: number;
  size?: number;
  start_date?: string;
  end_date?: string;
}

