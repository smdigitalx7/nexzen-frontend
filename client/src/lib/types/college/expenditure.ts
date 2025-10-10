export interface CollegeExpenditureCreate {
  expenditure_purpose: string;
  bill_date: string; // YYYY-MM-DD
  amount: number;
  remarks?: string | null;
  payment_method?: string | null;
  payment_date?: string | null; // YYYY-MM-DD
}

export interface CollegeExpenditureUpdate {
  expenditure_purpose?: string;
  bill_date?: string; // YYYY-MM-DD
  amount?: number;
  remarks?: string | null;
  payment_method?: string | null;
  payment_date?: string | null; // YYYY-MM-DD
}

export interface CollegeExpenditureRead {
  expenditure_id: number;
  expenditure_purpose: string;
  bill_date: string; // YYYY-MM-DD
  amount: number;
  remarks?: string | null;
  payment_method?: string | null;
  payment_date?: string | null; // YYYY-MM-DD
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}


