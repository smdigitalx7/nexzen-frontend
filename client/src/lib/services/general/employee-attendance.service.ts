import { Api } from "@/lib/api";
import type { 
  EmployeeAttendanceRead, 
  EmployeeAttendanceCreate, 
  EmployeeAttendanceUpdate,
  IndividualAttendanceCreateRequest,
  IndividualAttendanceUpdateRequest,
  AttendanceListResponse,
  AttendanceDashboardStats
} from "@/lib/types/general/employee-attendance";

/**
 * EmployeeAttendanceService - Handles all employee attendance-related API operations
 * 
 * Required roles for most operations: ADMIN, INSTITUTE_ADMIN, ACCOUNTANT
 * 
 * Available endpoints:
 * - GET /employee-attendances/dashboard - Get attendance dashboard statistics
 * - GET /employee-attendances/ - List all attendances (with filters)
 * - GET /employee-attendances/branch - List attendances by branch
 * - GET /employee-attendances/{id} - Get attendance by ID
 * - POST /employee-attendances/ - Create new attendance record
 * - PUT /employee-attendances/{id} - Update attendance record
 * - DELETE /employee-attendances/{id} - Delete attendance record
 */
export const EmployeeAttendanceService = {
  /**
   * Get attendance dashboard statistics
   * @returns Promise<AttendanceDashboardStats> - Dashboard statistics
   */
  getDashboard(): Promise<AttendanceDashboardStats> {
    return Api.get<AttendanceDashboardStats>("/employee-attendances/dashboard");
  },

  /**
   * Get all employee attendances with optional filters
   * @param month - Filter by month (1-12)
   * @param year - Filter by year
   * @returns Promise<AttendanceListResponse> - Paginated attendance list
   */
  listAll(month?: number, year?: number): Promise<AttendanceListResponse> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/employee-attendances/?${queryString}` : '/employee-attendances/';
    
    return Api.get<AttendanceListResponse>(url);
  },

  /**
   * Get all employee attendances by branch with optional filters
   * @param month - Filter by month (1-12)
   * @param year - Filter by year
   * @returns Promise<AttendanceListResponse> - Paginated attendance list
   */
  listByBranch(month?: number, year?: number): Promise<AttendanceListResponse> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/employee-attendances/branch?${queryString}` : '/employee-attendances/branch';
    
    return Api.get<AttendanceListResponse>(url);
  },

  /**
   * Get a specific attendance record by ID
   * @param id - Attendance ID
   * @returns Promise<EmployeeAttendanceRead> - Attendance details
   */
  getById(id: number): Promise<EmployeeAttendanceRead> {
    return Api.get<EmployeeAttendanceRead>(`/employee-attendances/${id}`);
  },

  /**
   * Create a new attendance record (individual)
   * Uses stored procedure to automatically calculate paid and unpaid leaves from approved leave records.
   * @param payload - Individual attendance creation data (employee_id, total_working_days, month, year)
   * @returns Promise<EmployeeAttendanceRead> - Created attendance details
   */
  create(payload: IndividualAttendanceCreateRequest): Promise<EmployeeAttendanceRead> {
    return Api.post<EmployeeAttendanceRead>("/employee-attendances/individual", payload);
  },

  /**
   * Create bulk attendance records for all active employees
   * @param payload - Bulk attendance creation data (total_working_days, month, year)
   * @returns Promise<string> - Success message
   */
  createBulk(payload: { total_working_days: number; month: number; year: number }): Promise<string> {
    return Api.post<string>("/employee-attendances/bulk", payload);
  },

  /**
   * Update an existing attendance record (by ID)
   * @param id - Attendance ID
   * @param payload - Attendance update data
   * @returns Promise<EmployeeAttendanceRead> - Updated attendance details
   */
  update(id: number, payload: EmployeeAttendanceUpdate): Promise<EmployeeAttendanceRead> {
    return Api.put<EmployeeAttendanceRead>(`/employee-attendances/${id}`, payload);
  },

  /**
   * Update bulk attendance records for the current branch, month, and year
   * Recalculates paid and unpaid leaves based on approved leave records. Only updates records where there are actual changes.
   * @param payload - Bulk attendance update data (total_working_days, month, year)
   * @returns Promise<string> - Success message
   */
  updateBulk(payload: { total_working_days: number; month: number; year: number }): Promise<string> {
    return Api.put<string>("/employee-attendances/bulk", payload);
  },

  /**
   * Delete an attendance record
   * @param id - Attendance ID
   * @returns Promise<boolean> - Success status
   */
  remove(id: number): Promise<boolean> {
    return Api.delete<boolean>(`/employee-attendances/${id}`);
  },
};