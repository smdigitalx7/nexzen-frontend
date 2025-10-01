import { AdvanceStatus } from '../../domain/entities/Advance';

export interface CreateAdvanceRequest {
  employeeId: number;
  amount: number;
  reason: string;
  branchId: number;
  notes?: string;
}

export interface UpdateAdvanceRequest {
  id: number;
  amount?: number;
  reason?: string;
  notes?: string;
}

export interface UpdateAdvanceStatusRequest {
  id: number;
  status: AdvanceStatus;
  notes?: string;
}

export interface UpdateAdvanceAmountPaidRequest {
  id: number;
  amountPaid: number;
  notes?: string;
}

export interface AdvanceResponse {
  advance_id: number;
  employee_id: number;
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

export interface AdvanceListResponse {
  data: AdvanceResponse[];
  total: number;
  pages: number;
  current_page: number;
}
