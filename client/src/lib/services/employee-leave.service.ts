import { Api } from "@/lib/api";
import {
  EmployeeLeaveRead,
  EmployeeLeaveCreate,
  EmployeeLeaveUpdate,
  EmployeeLeaveReject,
  EmployeeLeaveQueryParams,
  EmployeeLeaveListResponse,
  EmployeeLeaveSummaryResponse,
} from "@/lib/types/employee-leave";

/**
 * Employee Leave Service
 * Handles all API calls related to employee leave management
 */

export const leaveService = {
  /**
   * Get all employee leave records with filtering and pagination
   */
  async list(params?: EmployeeLeaveQueryParams): Promise<EmployeeLeaveListResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.append("limit", params.limit.toString());
      if (params?.offset) searchParams.append("offset", params.offset.toString());
      if (params?.leave_status) searchParams.append("leave_status", params.leave_status);
      if (params?.branch_id) searchParams.append("branch_id", params.branch_id.toString());
      if (params?.month) searchParams.append("month", params.month.toString());
      if (params?.year) searchParams.append("year", params.year.toString());

      return await Api.get<EmployeeLeaveListResponse>(
        `/employee-leave/?${searchParams.toString()}`
      );
    } catch (error) {
      console.error("Error fetching leave records:", error);
      throw error;
    }
  },

  /**
   * Get leave records by branch
   */
  async listByBranch(): Promise<EmployeeLeaveListResponse> {
    try {
      return await Api.get<EmployeeLeaveListResponse>("/employee-leave/branch");
    } catch (error) {
      // Return empty response if backend endpoint is not available
      return {
        data: [],
        total: 0,
        pages: 1,
        current_page: 1,
        limit: 10
      };
    }
  },

  /**
   * Get leave record by ID
   */
  async getById(id: number): Promise<EmployeeLeaveRead> {
    try {
      return await Api.get<EmployeeLeaveRead>(`/employee-leave/${id}`);
    } catch (error) {
      console.error(`Error fetching leave record ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create new leave record
   */
  async create(data: EmployeeLeaveCreate): Promise<EmployeeLeaveRead> {
    try {
      return await Api.post<EmployeeLeaveRead>("/employee-leave/", data);
    } catch (error) {
      console.error("Error creating leave record:", error);
      throw error;
    }
  },

  /**
   * Update leave record
   */
  async update(
    id: number,
    data: EmployeeLeaveUpdate
  ): Promise<EmployeeLeaveRead> {
    try {
      return await Api.put<EmployeeLeaveRead>(`/employee-leave/${id}`, data);
    } catch (error) {
      console.error(`Error updating leave record ${id}:`, error);
      throw error;
    }
  },

  /**
   * Approve leave record
   */
  async approve(id: number): Promise<EmployeeLeaveRead> {
    try {
      return await Api.put<EmployeeLeaveRead>(`/employee-leave/${id}/approve`);
    } catch (error) {
      console.error(`Error approving leave record ${id}:`, error);
      throw error;
    }
  },

  /**
   * Reject leave record
   */
  async reject(id: number, data: EmployeeLeaveReject): Promise<EmployeeLeaveRead> {
    try {
      return await Api.put<EmployeeLeaveRead>(`/employee-leave/${id}/reject`, data);
    } catch (error) {
      console.error(`Error rejecting leave record ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete leave record
   */
  async remove(id: number): Promise<void> {
    try {
      return await Api.delete<void>(`/employee-leave/${id}`);
    } catch (error) {
      console.error(`Error deleting leave record ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get employee leave summary
   */
  async getSummary(employeeId: number, year?: number): Promise<EmployeeLeaveSummaryResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (year) searchParams.append("year", year.toString());

      return await Api.get<EmployeeLeaveSummaryResponse>(
        `/employee-leave/summary/${employeeId}?${searchParams.toString()}`
      );
    } catch (error) {
      console.error(`Error fetching leave summary for employee ${employeeId}:`, error);
      throw error;
    }
  },
};
