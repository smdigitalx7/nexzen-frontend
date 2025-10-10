export interface CollegeIncomeCreate {
  enrollment_id?: number | null;
  purpose: string; // e.g., OTHER, TERM_FEE, etc.
  amount: number;
  income_date: string; // YYYY-MM-DD
  term_number?: number | null;
  description?: string | null;
}

export interface CollegeIncomeCreateReservation {
  reservation_id: number;
  purpose: string; // RESERVATION_FEE
  amount: number;
  income_date: string; // YYYY-MM-DD
  description?: string | null;
}

export interface CollegeIncomeUpdate {
  purpose?: string;
  amount?: number;
  income_date?: string; // YYYY-MM-DD
  term_number?: number | null;
  description?: string | null;
}

export interface CollegeIncomeRead {
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
  description?: string | null;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}


