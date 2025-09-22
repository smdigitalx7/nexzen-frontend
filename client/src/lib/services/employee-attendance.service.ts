import { Api } from "@/lib/api";
import {
  EmployeeAttendanceRead,
  EmployeeAttendanceCreate,
  EmployeeAttendanceUpdate,
  AttendanceQueryParams,
  AttendanceListResponse,
} from "@/lib/types/employee-attendance";

/**
 * Employee Attendance Service
 * Handles all API calls related to employee attendance management
 */

export const attendanceService = {
  /**
   * Get all employee attendance records
   * Note: Backend doesn't currently support query parameters for attendance
   */
  async list(): Promise<AttendanceListResponse> {
    try {
      return await Api.get<AttendanceListResponse>("/employee-attendances/");
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      throw error;
    }
  },

  /**
   * Get attendance records by branch
   * Note: Backend doesn't currently support query parameters for attendance
   */
  async listByBranch(): Promise<AttendanceListResponse> {
    try {
      return await Api.get<AttendanceListResponse>("/employee-attendances/branch");
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
   * Get attendance record by ID
   */
  async getById(id: number): Promise<EmployeeAttendanceRead> {
    try {
      return await Api.get<EmployeeAttendanceRead>(`/employee-attendances/${id}`);
    } catch (error) {
      console.error(`Error fetching attendance record ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create new attendance record
   */
  async create(data: EmployeeAttendanceCreate): Promise<EmployeeAttendanceRead> {
    try {
      return await Api.post<EmployeeAttendanceRead>("/employee-attendances/", data);
    } catch (error) {
      console.error("Error creating attendance record:", error);
      throw error;
    }
  },

  /**
   * Update attendance record
   */
  async update(
    id: number,
    data: EmployeeAttendanceUpdate
  ): Promise<EmployeeAttendanceRead> {
    try {
      return await Api.put<EmployeeAttendanceRead>(`/employee-attendances/${id}`, data);
    } catch (error) {
      console.error(`Error updating attendance record ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete attendance record
   */
  async remove(id: number): Promise<boolean> {
    try {
      return await Api.delete<boolean>(`/employee-attendances/${id}`);
    } catch (error) {
      console.error(`Error deleting attendance record ${id}:`, error);
      throw error;
    }
  },
};
