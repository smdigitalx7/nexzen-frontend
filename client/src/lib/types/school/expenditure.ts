export interface SchoolExpenditureCreate {
  expenditure_purpose: string;
  bill_date: string; // YYYY-MM-DD
  amount: number;
  remarks?: string | null;
  payment_method?: string | null;
}

export interface SchoolExpenditureUpdate {
  expenditure_purpose?: string;
  bill_date?: string; // YYYY-MM-DD
  amount?: number;
  remarks?: string | null;
  payment_method?: string | null;
}

export interface SchoolExpenditureRead {
  expenditure_id: number;
  expenditure_purpose: string;
  bill_date: string; // YYYY-MM-DD
  amount: number;
  remarks?: string | null;
  payment_method?: string | null;
  purpose?: string | null;
  voucher_no?: string | null;
  status?: "PENDING" | "APPROVED" | "REJECTED" | null;
  approved_by?: number | null;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface SchoolExpenditureDashboardStats {
  total_expenditure_records: number;
  total_expenditure_amount: number;
  paid_expenditures: number;
  unpaid_expenditures: number;
  total_paid_amount: number;
  total_unpaid_amount: number;
  expenditure_this_month: number;
  expenditure_this_year: number;
  expenditure_records_this_month: number;
  expenditure_records_this_year: number;
}

export interface SchoolRecentExpenditure {
  expenditure_id: number;
  expenditure_purpose: string;
  bill_date: string;
  amount: number;
  payment_method?: string | null;
  payment_date?: string | null;
}

