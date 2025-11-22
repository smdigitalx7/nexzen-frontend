import { Api } from "@/core/api";
import type { 
  EmployeeLeaveRead, 
  EmployeeLeaveCreate, 
  EmployeeLeaveUpdate,
  EmployeeLeaveReject,
  EmployeeLeaveListResponse,
  LeaveDashboardStats,
  RecentLeave
} from "@/features/general/types/employee-leave";

/**
 * EmployeeLeaveService - Handles all employee leave-related API operations
 * 
 * Required roles for most operations: INSTITUTE_ADMIN, ADMIN, ACCOUNTANT
 * 
 * Available endpoints:
 * - GET /employee-leave/dashboard - Get leave dashboard statistics
 * - GET /employee-leave/recent - Get recent leave requests
 * - GET /employee-leave - List all leaves (with filters)
 * - GET /employee-leave/branch - List leaves by branch
 * - GET /employee-leave/{id} - Get leave by ID
 * - POST /employee-leave - Create new leave request
 * - PUT /employee-leave/{id} - Update leave request
 * - PUT /employee-leave/{id}/approve - Approve leave request
 * - PUT /employee-leave/{id}/reject - Reject leave request
 * - DELETE /employee-leave/{id} - Delete leave request
 */
export const EmployeeLeaveService = {
  /**
   * Get leave dashboard statistics
   * @returns Promise<LeaveDashboardStats> - Dashboard statistics
   */
  getDashboard(): Promise<LeaveDashboardStats> {
    return Api.get<LeaveDashboardStats>("/employee-leave/dashboard");
  },

  /**
   * Get recent leave requests
   * @param limit - Number of recent records to return (default: 5)
   * @returns Promise<RecentLeave[]> - List of recent leaves
   */
  getRecent(limit: number = 5): Promise<RecentLeave[]> {
    return Api.get<RecentLeave[]>(`/employee-leave/recent?limit=${limit}`);
  },

  /**
   * Get all employee leaves with optional filters
   * @param pageSize - Number of records per page (default: 10)
   * @param page - Page number (default: 1)
   * @param leaveStatus - Filter by leave status
   * @param month - Filter by month (1-12)
   * @param year - Filter by year
   * @returns Promise<EmployeeLeaveListResponse> - Paginated leave list
   */
  listAll(pageSize: number = 10, page: number = 1, leaveStatus?: string, month?: number, year?: number): Promise<EmployeeLeaveListResponse> {
    const params = new URLSearchParams();
    params.append('pageSize', pageSize.toString());
    params.append('page', page.toString());
    if (leaveStatus) params.append('leave_status', leaveStatus);
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    
    return Api.get<EmployeeLeaveListResponse>(`/employee-leave?${params.toString()}`);
  },

  /**
   * Get all employee leaves by branch with required filters
   * @param month - Filter by month (1-12, required)
   * @param year - Filter by year (required)
   * @param pageSize - Number of records per page (default: 10)
   * @param page - Page number (default: 1)
   * @param leaveStatus - Filter by leave status
   * @returns Promise<EmployeeLeaveListResponse> - Paginated leave list
   */
  listByBranch(month: number, year: number, pageSize: number = 10, page: number = 1, leaveStatus?: string): Promise<EmployeeLeaveListResponse> {
    const params = new URLSearchParams();
    params.append('month', month.toString());
    params.append('year', year.toString());
    params.append('pageSize', pageSize.toString());
    params.append('page', page.toString());
    if (leaveStatus) params.append('leave_status', leaveStatus);
    
    return Api.get<EmployeeLeaveListResponse>(`/employee-leave/branch?${params.toString()}`);
  },

  /**
   * Get a specific leave request by ID
   * @param id - Leave ID
   * @returns Promise<EmployeeLeaveRead> - Leave details
   */
  getById(id: number): Promise<EmployeeLeaveRead> {
    return Api.get<EmployeeLeaveRead>(`/employee-leave/${id}`);
  },

  /**
   * Create a new leave request
   * @param payload - Leave creation data
   * @returns Promise<EmployeeLeaveRead> - Created leave details
   */
  create(payload: EmployeeLeaveCreate): Promise<EmployeeLeaveRead> {
    return Api.post<EmployeeLeaveRead>("/employee-leave", payload);
  },

  /**
   * Update an existing leave request
   * @param id - Leave ID
   * @param payload - Leave update data
   * @returns Promise<EmployeeLeaveRead> - Updated leave details
   */
  update(id: number, payload: EmployeeLeaveUpdate): Promise<EmployeeLeaveRead> {
    return Api.put<EmployeeLeaveRead>(`/employee-leave/${id}`, payload);
  },

  /**
   * Approve a leave request
   * @param id - Leave ID
   * @returns Promise<EmployeeLeaveRead> - Updated leave details
   */
  approve(id: number): Promise<EmployeeLeaveRead> {
    return Api.put<EmployeeLeaveRead>(`/employee-leave/${id}/approve`, {});
  },

  /**
   * Reject a leave request
   * @param id - Leave ID
   * @param payload - Rejection data
   * @returns Promise<EmployeeLeaveRead> - Updated leave details
   */
  reject(id: number, payload: EmployeeLeaveReject): Promise<EmployeeLeaveRead> {
    return Api.put<EmployeeLeaveRead>(`/employee-leave/${id}/reject`, payload);
  },

  /**
   * Delete a leave request
   * @param id - Leave ID
   * @returns Promise<boolean> - Success status (returns true on 204 No Content)
   */
  remove(id: number): Promise<boolean> {
    return Api.delete<boolean>(`/employee-leave/${id}`).then((result) => {
      // Backend returns 204 No Content, which becomes undefined
      // Return true to indicate success
      return result !== undefined ? result : true;
    });
  },
};