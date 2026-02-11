export enum PayrollStatusEnum {
  PENDING = "PENDING",
  PAID = "PAID",
  HOLD = "HOLD",
}

export enum PaymentMethodEnum {
  CASH = "CASH",
  UPI = "UPI",
  CARD = "CARD",
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
  payroll_month: number; // Month as number (1-12)
  payroll_year: number; // Year as number (e.g., 2024)
  other_deductions?: number;
  advance_amount?: number; // Note: API uses advance_amount, not advance_deduction
  paid_amount: number;
  payment_method: PaymentMethodEnum;
  payment_notes: string;
  // Optional fields that might be calculated by backend
  gross_pay?: number;
  previous_balance?: number;
  lop?: number;
}

export interface PayrollUpdate {
  other_deductions: number;
  advance_amount: number;
  paid_amount: number;
  payment_notes: string;
}

export interface PayrollStatusUpdate {
  status: PayrollStatusEnum;
}

export interface PayrollQuery {
  month?: number;
  year?: number;
  status?: string;
  page?: number;
  page_size?: number;
  limit?: number;
  offset?: number;
}

export interface PayrollListResponse {
  data: PayrollRead[];
  total_count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
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

export interface PayrollPreview {
  gross_pay: number;
  previous_balance: number;
  lop: number;
  advance_deduction: number;
  other_deductions: number;
  total_deductions: number;
  net_pay: number;
}

export interface PayrollPreviewRequest {
  employee_id: number;
  month: number;
  year: number;
}

// Extended interface for detailed payroll view that includes employee information
export interface DetailedPayrollRead
  extends Omit<PayrollRead, "payroll_month"> {
  employee_name: string;
  employee_type: string;
  payroll_month: number;
  payroll_year: number;
}
