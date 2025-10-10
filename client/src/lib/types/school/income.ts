export interface SchoolIncomeCreate {
  enrollment_id?: number | null;
  purpose: string;
  amount: number;
  income_date: string; // YYYY-MM-DD
  term_number?: number | null;
  description?: string | null;
}

export interface SchoolIncomeCreateReservation {
  reservation_id: number;
  purpose: string;
  amount: number;
  income_date: string; // YYYY-MM-DD
  description?: string | null;
}

export interface SchoolIncomeUpdate {
  purpose?: string;
  amount?: number;
  income_date?: string; // YYYY-MM-DD
  term_number?: number | null;
  description?: string | null;
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
  description?: string | null;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}


