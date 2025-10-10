import { Api } from "@/lib/api";
import type { 
  EmployeeAttendanceRead, 
  EmployeeAttendanceCreate, 
  EmployeeAttendanceUpdate,
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
   * Create a new attendance record
   * @param payload - Attendance creation data
   * @returns Promise<EmployeeAttendanceRead> - Created attendance details
   */
  create(payload: EmployeeAttendanceCreate): Promise<EmployeeAttendanceRead> {
    return Api.post<EmployeeAttendanceRead>("/employee-attendances", payload);
  },

  /**
   * Update an existing attendance record
   * @param id - Attendance ID
   * @param payload - Attendance update data
   * @returns Promise<EmployeeAttendanceRead> - Updated attendance details
   */
  update(id: number, payload: EmployeeAttendanceUpdate): Promise<EmployeeAttendanceRead> {
    return Api.put<EmployeeAttendanceRead>(`/employee-attendances/${id}`, payload);
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