export interface SchoolIncomeCreate {
  enrollment_id?: number | null;
  purpose: string;
  amount: number;
  income_date: string; // YYYY-MM-DD
  term_number?: number | null;
  payment_method: string;
  note?: string | null;
}

export interface SchoolIncomeCreateReservation {
  reservation_id: number;
  purpose: string;
  amount: number;
  income_date: string; // YYYY-MM-DD
  payment_method: string;
  note?: string | null;
}

export interface SchoolIncomeUpdate {
  purpose?: string;
  amount?: number;
  income_date?: string; // YYYY-MM-DD
  term_number?: number | null;
  payment_method: string;
  note?: string | null;
}

export interface SchoolIncomeRead {
  income_id: number;
  enrollment_id?: number | null;
  reservation_id?: number | null;
  admission_no?: string | null;
  roll_number?: string | null;
  student_name?: string | null;
  purpose: string;
  amount: number;
  income_date: string; // YYYY-MM-DD
  term_number?: number | null;
  payment_method?: string | null;
  note?: string | null;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

// Dashboard and Recent schemas
export interface SchoolRecentIncome {
  income_id: number;
  student_name?: string | null;
  admission_no?: string | null;
  purpose: string;
  amount: number;
  income_date: string;
}

export interface SchoolIncomeDashboardStats {
  total_income_records: number;
  total_income_amount: number;
  tuition_fee_income: number;
  transport_fee_income: number;
  book_fee_income: number;
  reservation_fee_income: number;
  other_income: number;
  income_this_month: number;
  income_this_year: number;
  income_records_this_month: number;
  income_records_this_year: number;
}


