import { Api } from "@/lib/api";
import type { 
  AdvanceRead, 
  AdvanceCreate, 
  AdvanceUpdate,
  AdvanceListResponse,
  AdvanceDashboardStats,
  RecentAdvance
} from "@/lib/types/general/advances";

/**
 * AdvancesService - Handles all advance-related API operations
 * 
 * Required roles for most operations: ADMIN, INSTITUTE_ADMIN, ACCOUNTANT
 * 
 * Available endpoints:
 * - GET /advances/dashboard - Get advance dashboard statistics
 * - GET /advances/recent - Get recent advance requests
 * - GET /advances/ - List all advances (with filters)
 * - GET /advances/branch - List advances by branch
 * - GET /advances/{id} - Get advance by ID
 * - POST /advances/ - Create new advance request
 * - PUT /advances/{id} - Update advance request
 * - PUT /advances/{id}/status - Update advance status
 * - PUT /advances/{id}/amount-paid - Update amount paid
 */
export const AdvancesService = {
  /**
   * Get advance dashboard statistics
   * @returns Promise<AdvanceDashboardStats> - Dashboard statistics
   */
  getDashboard(): Promise<AdvanceDashboardStats> {
    return Api.get<AdvanceDashboardStats>("/advances/dashboard");
  },

  /**
   * Get recent advance requests
   * @param limit - Number of recent records to return (default: 5)
   * @returns Promise<RecentAdvance[]> - List of recent advances
   */
  getRecent(limit: number = 5): Promise<RecentAdvance[]> {
    return Api.get<RecentAdvance[]>(`/advances/recent?limit=${limit}`);
  },

  /**
   * Get all advances with optional filters
   * @param pageSize - Number of records per page (default: 10)
   * @param page - Page number (default: 1)
   * @param month - Filter by month (1-12)
   * @param year - Filter by year
   * @param status - Filter by status
   * @returns Promise<AdvanceListResponse> - Paginated advance list
   */
  listAll(pageSize: number = 10, page: number = 1, month?: number, year?: number, status?: string): Promise<AdvanceListResponse> {
    const params = new URLSearchParams();
    params.append('pageSize', pageSize.toString());
    params.append('page', page.toString());
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    if (status) params.append('status', status);
    
    return Api.get<AdvanceListResponse>(`/advances?${params.toString()}`);
  },

  /**
   * Get all advances by branch with optional filters
   * @param pageSize - Number of records per page (default: 10)
   * @param page - Page number (default: 1)
   * @param month - Filter by month (1-12)
   * @param year - Filter by year
   * @param status - Filter by status
   * @returns Promise<AdvanceListResponse> - Paginated advance list
   */
  listByBranch(pageSize: number = 10, page: number = 1, month?: number, year?: number, status?: string): Promise<AdvanceListResponse> {
    const params = new URLSearchParams();
    params.append('pageSize', pageSize.toString());
    params.append('page', page.toString());
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    if (status) params.append('status', status);
    
    return Api.get<AdvanceListResponse>(`/advances/branch?${params.toString()}`);
  },

  /**
   * Get a specific advance by ID
   * @param id - Advance ID
   * @returns Promise<AdvanceRead> - Advance details
   */
  getById(id: number): Promise<AdvanceRead> {
    return Api.get<AdvanceRead>(`/advances/${id}`);
  },

  /**
   * Create a new advance request
   * @param payload - Advance creation data
   * @returns Promise<AdvanceRead> - Created advance details
   */
  create(payload: AdvanceCreate): Promise<AdvanceRead> {
    return Api.post<AdvanceRead>("/advances", payload);
  },

  /**
   * Update an existing advance request
   * @param id - Advance ID
   * @param payload - Advance update data
   * @returns Promise<AdvanceRead> - Updated advance details
   */
  update(id: number, payload: AdvanceUpdate): Promise<AdvanceRead> {
    return Api.put<AdvanceRead>(`/advances/${id}`, payload);
  },

  /**
   * Update advance status
   * @param id - Advance ID
   * @param status - New status
   * @returns Promise<AdvanceRead> - Updated advance details
   */
  updateStatus(id: number, status: string): Promise<AdvanceRead> {
    return Api.put<AdvanceRead>(`/advances/${id}/status`, { status });
  },

  /**
   * Update amount paid for advance
   * @param id - Advance ID
   * @param amountPaid - Amount paid
   * @returns Promise<AdvanceRead> - Updated advance details
   */
  updateAmountPaid(id: number, amountPaid: number): Promise<AdvanceRead> {
    return Api.put<AdvanceRead>(`/advances/${id}/amount-paid`, { amount_paid: amountPaid });
  },
};