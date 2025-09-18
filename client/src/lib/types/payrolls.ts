export interface PayrollRead {
  payroll_id: number;
  branch_id: number;
  employee_id: number;
  month: number;
  year: number;
  status: string;
  amount: number;
}

export interface PayrollCreate {
  branch_id: number;
  employee_id: number;
  month: number;
  year: number;
  amount: number;
}

export type PayrollUpdate = Partial<PayrollCreate>;

export interface PayrollQuery {
  limit?: number;
  offset?: number;
  month?: number;
  year?: number;
  status?: string;
}

export interface PayrollListResponse {
  items: PayrollRead[];
  total: number;
}


