import { Api } from "@/core/api";
import type { PayrollRead, PayrollQuery, PayrollListResponse, PayrollDashboardStats, RecentPayroll, PayrollPreview, PayrollPreviewRequest, PayrollCreate, PayrollUpdate } from "@/features/general/types/payrolls";

export const PayrollsService = {
  /**
   * Get payroll dashboard statistics
   * @returns Promise<PayrollDashboardStats> - Dashboard statistics
   */
  getDashboard(): Promise<PayrollDashboardStats> {
    return Api.get<PayrollDashboardStats>("/payrolls/dashboard");
  },

  /**
   * Get recent payrolls
   * @param limit - Number of recent records to return (default: 5)
   * @returns Promise<RecentPayroll[]> - List of recent payrolls
   */
  getRecent(limit: number = 5): Promise<RecentPayroll[]> {
    return Api.get<RecentPayroll[]>(`/payrolls/recent?limit=${limit}`);
  },

  /**
   * Get all payrolls with optional filters
   * @param month - Filter by month (1-12, requires year)
   * @param year - Filter by year (2000-2100, requires month)
   * @param status - Filter by payroll status (PENDING|PAID|HOLD)
   * @returns Promise<PayrollListResponse> - Payroll list grouped by month
   */
  listAll(month?: number, year?: number, status?: string): Promise<any> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    if (status) params.append('payroll_status', status);
    
    const url = `/payrolls?${params.toString()}`;
    return Api.get<any>(url);
  },

  /**
   * Get all payrolls by branch with optional filters
   * @param month - Filter by month (1-12, required)
   * @param year - Filter by year (2000-2100, required)
   * @param status - Filter by payroll status (PENDING|PAID|HOLD)
   * @returns Promise<PayrollListResponse> - Payroll list grouped by month (filtered by current branch)
   */
  listByBranch(month: number, year: number, status?: string): Promise<PayrollListResponse> {
    const params = new URLSearchParams();
    params.append('month', month.toString());
    params.append('year', year.toString());
    if (status) params.append('payroll_status', status);
    
    return Api.get<PayrollListResponse>(`/payrolls/branch?${params.toString()}`);
  },

  /**
   * Get a specific payroll by ID
   * @param id - Payroll ID
   * @returns Promise<PayrollRead> - Payroll details
   */
  getById(id: number): Promise<PayrollRead> {
    return Api.get<PayrollRead>(`/payrolls/${id}`);
  },

  /**
   * Get employee payroll summary
   * @param employeeId - Employee ID
   * @param year - Year (2000-2100, required)
   * @returns Promise<any> - Employee payroll summary
   */
  getEmployeeSummary(employeeId: number, year: number): Promise<any> {
    return Api.get(`/payrolls/employee/${employeeId}/summary?year=${year}`);
  },

  /**
   * Get pending payroll count
   * @returns Promise<number> - Pending payroll count
   */
  getPendingCount(): Promise<number> {
    return Api.get<number>("/payrolls/pending/count");
  },

  /**
   * Get payrolls in date range
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @param branchId - Optional branch ID filter
   * @returns Promise<PayrollListResponse> - Payrolls in date range
   */
  getByDateRange(startDate: string, endDate: string, branchId?: number): Promise<PayrollListResponse> {
    const params = new URLSearchParams();
    params.append('start_date', startDate);
    params.append('end_date', endDate);
    if (branchId) params.append('branch_id', branchId.toString());
    
    return Api.get<PayrollListResponse>(`/payrolls/date-range?${params.toString()}`);
  },

  /**
   * Get employee payroll balance
   * @param employeeId - Employee ID
   * @param year - Year (2000-2100, required)
   * @returns Promise<any> - Employee payroll balance
   */
  getEmployeeBalance(employeeId: number, year: number): Promise<any> {
    return Api.get(`/payrolls/employee/${employeeId}/balance?year=${year}`);
  },

  /**
   * Get employee payrolls
   * @param employeeId - Employee ID
   * @returns Promise<PayrollListResponse> - Employee payrolls
   */
  getEmployeePayrolls(employeeId: number): Promise<PayrollListResponse> {
    return Api.get<PayrollListResponse>(`/payrolls/employee/${employeeId}/payrolls`);
  },

  /**
   * Get payroll preview for an employee
   * @param payload - Preview request data (employee_id, month, year)
   * @returns Promise<PayrollPreview> - Payroll preview with calculated values
   */
  getPreview(payload: PayrollPreviewRequest): Promise<PayrollPreview> {
    return Api.post<PayrollPreview>("/payrolls/preview", payload);
  },

  /**
   * Create a new payroll for an employee
   * @param payload - Payroll creation data
   * @returns Promise<PayrollRead> - Created payroll details
   */
  create(payload: PayrollCreate): Promise<PayrollRead> {
    return Api.post<PayrollRead>("/payrolls", payload);
  },

  /**
   * Update an existing payroll
   * @param id - Payroll ID
   * @param payload - Payroll update data
   * @returns Promise<PayrollRead> - Updated payroll details
   */
  update(id: number, payload: PayrollUpdate): Promise<PayrollRead> {
    return Api.put<PayrollRead>(`/payrolls/${id}`, payload);
  },
};


