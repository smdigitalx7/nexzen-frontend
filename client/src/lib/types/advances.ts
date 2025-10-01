export interface AdvanceRead {
  advance_id: number;
  employee_id: number;
  advance_date: string; // Backend uses advance_date
  advance_amount: number; // Backend uses advance_amount
  total_repayment_amount?: number;
  remaining_balance?: number;
  request_reason?: string; // Backend uses request_reason
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
  advance_date: string; // Backend uses advance_date
  advance_amount: number; // Backend uses advance_amount
  request_reason: string; // Backend uses request_reason
}

export type AdvanceUpdate = Partial<AdvanceCreate>;

export interface AdvanceListResponse {
  data: AdvanceRead[];
  total: number;
  pages: number;
  current_page: number;
}


