import { Api } from "@/lib/api";
import type { PayrollRead, PayrollCreate, PayrollUpdate, PayrollQuery, PayrollListResponse } from "@/lib/types/general/payrolls";

export const PayrollsService = {
  /**
   * Get payroll dashboard statistics
   * @returns Promise<any> - Dashboard statistics
   */
  getDashboard(): Promise<any> {
    return Api.get("/payrolls/dashboard");
  },

  /**
   * Get recent payrolls
   * @param limit - Number of recent records to return (default: 5)
   * @returns Promise<PayrollRead[]> - List of recent payrolls
   */
  getRecent(limit: number = 5): Promise<PayrollRead[]> {
    return Api.get(`/payrolls/recent?limit=${limit}`);
  },

  /**
   * Get all payrolls with optional filters
   * @param pageSize - Number of records per page (default: 10)
   * @param page - Page number (default: 1)
   * @param month - Filter by month (1-12)
   * @param year - Filter by year
   * @param status - Filter by status
   * @returns Promise<PayrollListResponse> - Paginated payroll list
   */
  listAll(month?: number, year?: number, status?: string): Promise<any> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    if (status) params.append('status', status);
    
    const url = `/payrolls?${params.toString()}`;
    return Api.get<any>(url);
  },

  /**
   * Get all payrolls by branch with optional filters
   * @param pageSize - Number of records per page (default: 10)
   * @param page - Page number (default: 1)
   * @param month - Filter by month (1-12)
   * @param year - Filter by year
   * @param status - Filter by status
   * @returns Promise<PayrollListResponse> - Paginated payroll list
   */
  listByBranch(pageSize: number = 10, page: number = 1, month?: number, year?: number, status?: string): Promise<PayrollListResponse> {
    const params = new URLSearchParams();
    params.append('pageSize', pageSize.toString());
    params.append('page', page.toString());
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    if (status) params.append('status', status);
    
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
   * Create a new payroll
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

  /**
   * Delete a payroll
   * @param id - Payroll ID
   * @returns Promise<boolean> - Success status
   */
  remove(id: number): Promise<boolean> {
    return Api.delete<boolean>(`/payrolls/${id}`);
  },

  /**
   * Bulk create payrolls
   * @param payload - Array of payroll creation data
   * @returns Promise<PayrollRead[]> - Created payrolls
   */
  bulkCreate(payload: PayrollCreate[]): Promise<PayrollRead[]> {
    return Api.post<PayrollRead[]>("/payrolls/bulk", payload);
  },

  /**
   * Update payroll status
   * @param id - Payroll ID
   * @param status - New status
   * @returns Promise<PayrollRead> - Updated payroll details
   */
  updateStatus(id: number, status: string): Promise<PayrollRead> {
    return Api.put<PayrollRead>(`/payrolls/${id}/status`, { status });
  },

  /**
   * Get employee payroll summary
   * @param employeeId - Employee ID
   * @returns Promise<any> - Employee payroll summary
   */
  getEmployeeSummary(employeeId: number): Promise<any> {
    return Api.get(`/payrolls/employee/${employeeId}/summary`);
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
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Promise<PayrollListResponse> - Payrolls in date range
   */
  getByDateRange(startDate: string, endDate: string): Promise<PayrollListResponse> {
    const params = new URLSearchParams();
    params.append('start_date', startDate);
    params.append('end_date', endDate);
    
    return Api.get<PayrollListResponse>(`/payrolls/date-range?${params.toString()}`);
  },

  /**
   * Get employee payroll balance
   * @param employeeId - Employee ID
   * @returns Promise<any> - Employee payroll balance
   */
  getEmployeeBalance(employeeId: number): Promise<any> {
    return Api.get(`/payrolls/employee/${employeeId}/balance`);
  },

  /**
   * Get employee payrolls
   * @param employeeId - Employee ID
   * @returns Promise<PayrollListResponse> - Employee payrolls
   */
  getEmployeePayrolls(employeeId: number): Promise<PayrollListResponse> {
    return Api.get<PayrollListResponse>(`/payrolls/employee/${employeeId}/payrolls`);
  },
};


