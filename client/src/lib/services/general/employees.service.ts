import { Api } from "@/lib/api";
import type { 
  EmployeeRead, 
  EmployeeCreate, 
  EmployeeUpdate, 
  EmployeeWithBranches,
  TeacherByBranch,
  EmployeeDashboardStats,
  RecentEmployee
} from "@/lib/types/general/employees";

export const EmployeesService = {
  /**
   * Get employee dashboard statistics
   * @returns Promise<EmployeeDashboardStats> - Dashboard statistics
   */
  getDashboard(): Promise<EmployeeDashboardStats> {
    return Api.get<EmployeeDashboardStats>("/employees/dashboard");
  },

  /**
   * Get recent employees
   * @param limit - Number of recent records to return (default: 5)
   * @returns Promise<RecentEmployee[]> - List of recent employees
   */
  getRecent(limit: number = 5): Promise<RecentEmployee[]> {
    return Api.get<RecentEmployee[]>(`/employees/recent?limit=${limit}`);
  },

  /**
   * Get all employees by institute (requires INSTITUTE_ADMIN, ADMIN, ACADEMIC, ACCOUNTANT role)
   */
  listByInstitute(): Promise<EmployeeRead[]> {
    return Api.get<EmployeeRead[]>("/employees");
  },

  /**
   * Get all employees with their branches (requires INSTITUTE_ADMIN role)
   */
  listWithBranches(): Promise<EmployeeWithBranches[]> {
    return Api.get<EmployeeWithBranches[]>("/employees/with-branches");
  },

  /**
   * Get all employees by branch (requires INSTITUTE_ADMIN, ADMIN, ACADEMIC, or ACCOUNTANT role)
   */
  listByBranch(): Promise<EmployeeRead[]> {
    return Api.get<EmployeeRead[]>("/employees/branch");
  },

  /**
   * Get teachers by branch (requires INSTITUTE_ADMIN, ADMIN, ACADEMIC, or ACCOUNTANT role)
   */
  getTeachersByBranch(): Promise<TeacherByBranch[]> {
    return Api.get<TeacherByBranch[]>("/employees/teacher-by-branch");
  },

  /**
   * Get employee by ID (requires INSTITUTE_ADMIN, ADMIN, ACADEMIC, or ACCOUNTANT role)
   */
  getById(id: number): Promise<EmployeeRead> {
    return Api.get<EmployeeRead>(`/employees/${id}`);
  },

  /**
   * Create new employee (requires INSTITUTE_ADMIN, ADMIN role)
   */
  create(payload: EmployeeCreate): Promise<EmployeeRead> {
    return Api.post<EmployeeRead>("/employees", payload);
  },

  /**
   * Update employee (requires INSTITUTE_ADMIN, ADMIN role)
   */
  update(id: number, payload: EmployeeUpdate): Promise<EmployeeRead> {
    return Api.put<EmployeeRead>(`/employees/${id}`, payload);
  },

  /**
   * Delete employee (requires INSTITUTE_ADMIN, ADMIN role)
   */
  remove(id: number): Promise<{ success: boolean; message: string }> {
    return Api.delete<{ success: boolean; message: string }>(`/employees/${id}`);
  },

  /**
   * Update employee status only
   * Uses PATCH /employees/{id}/status endpoint
   */
  updateStatus(id: number, status: string): Promise<EmployeeRead> {
    return Api.patch<EmployeeRead>(`/employees/${id}/status`, { status });
  },
};


