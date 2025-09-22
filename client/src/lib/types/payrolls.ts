export enum PayrollStatusEnum {
  PENDING = "PENDING",
  PAID = "PAID",
  HOLD = "HOLD"
}

export enum PaymentMethodEnum {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  CHEQUE = "CHEQUE",
  UPI = "UPI",
  OTHER = "OTHER"
}

export interface PayrollRead {
  payroll_id: number;
  employee_id: number;
  payroll_month: string; // date as string
  previous_balance: number;
  gross_pay: number;
  lop: number;
  advance_deduction: number;
  other_deductions: number;
  total_deductions: number;
  net_pay: number;
  paid_amount: number;
  carryover_balance: number;
  payment_method?: PaymentMethodEnum;
  payment_notes?: string;
  status: PayrollStatusEnum;
  generated_at: string; // datetime as string
  updated_at?: string;
  generated_by?: number;
  updated_by?: number;
}

export interface PayrollCreate {
  employee_id: number;
  payroll_month: string; // date as string
  previous_balance?: number;
  gross_pay: number;
  lop?: number;
  advance_deduction?: number;
  other_deductions?: number;
}

export interface PayrollUpdate {
  previous_balance?: number;
  gross_pay?: number;
  lop?: number;
  advance_deduction?: number;
  other_deductions?: number;
  paid_amount?: number;
  payment_method?: PaymentMethodEnum;
  payment_notes?: string;
  status?: PayrollStatusEnum;
}

export interface PayrollQuery {
  limit?: number;
  offset?: number;
  month?: number;
  year?: number;
  status?: string;
}

export interface PayrollListResponse {
  data: PayrollRead[];
  total: number;
  pages: number;
  current_page: number;
  pageSize?: number;
}


