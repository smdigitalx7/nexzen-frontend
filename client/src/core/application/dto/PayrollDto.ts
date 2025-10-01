export interface CreatePayrollRequest {
  employeeId: number;
  branchId: number;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  status: string;
  paymentMethod: string;
  paymentDate?: Date;
  notes?: string;
}

export interface UpdatePayrollRequest {
  id: number;
  basicSalary?: number;
  allowances?: number;
  deductions?: number;
  status?: string;
  paymentMethod?: string;
  paymentDate?: Date;
  notes?: string;
}

export interface PayrollResponse {
  id: number;
  employeeId: number;
  branchId: number;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: string;
  paymentMethod: string;
  paymentDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
