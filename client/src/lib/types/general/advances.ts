export interface AdvanceRead {
  advance_id: number;
  employee_id: number;
  employee_name?: string;
  advance_date: string;
  advance_amount: number;
  total_repayment_amount?: number;
  remaining_balance?: number;
  request_reason?: string;
  status?: string;
  created_at: string;
  updated_at?: string;
  created_by?: number | null;
  approved_by?: number | null;
  approved_at?: string | null;
  reason?: string | null;
  updated_by?: number | null;
}

export interface AdvanceCreate {
  employee_id: number;
  advance_date: string;
  advance_amount: number;
  request_reason: string;
}

export type AdvanceUpdate = Partial<AdvanceCreate>;

export interface AdvanceListResponse {
  data: AdvanceRead[];
  total: number;
  pages: number;
  current_page: number;
  pageSize?: number;
}

export interface AdvanceDashboardStats {
  total_advances: number;
  pending_advances: number;
  approved_advances: number;
  rejected_advances: number;
  active_advances: number;
  repaid_advances: number;
  total_advance_amount: number;
  total_repaid_amount: number;
  total_outstanding_amount: number;
  advances_this_month: number;
  advances_this_year: number;
}

export interface RecentAdvance {
  advance_id: number;
  employee_id: number;
  employee_name?: string;
  advance_date: string;
  advance_amount: number;
  remaining_balance: number;
  status: string;
  created_at: string;
}
