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
  generated_by?: number | null;
  updated_by?: number | null;
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
  pageSize?: number;
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

export interface PayrollDashboardStats {
  total_payroll_records: number;
  pending_payrolls: number;
  paid_payrolls: number;
  hold_payrolls: number;
  current_month_payrolls: number;
  total_gross_pay: number;
  total_net_pay: number;
  total_deductions: number;
  total_paid_amount: number;
  pending_payment_amount: number;
  average_salary: number;
}

export interface RecentPayroll {
  payroll_id: number;
  employee_id: number;
  employee_name?: string;
  payroll_month: string;
  gross_pay: number;
  net_pay: number;
  status: PayrollStatusEnum;
  generated_at: string;
}

