import { Api } from "@/lib/api";
import type { EmployeeRead, EmployeeCreate, EmployeeUpdate } from "@/lib/types/employees";

export const EmployeesService = {
  /**
   * Get all employees by institute (requires INSTITUTE_ADMIN role)
   */
  listByInstitute(): Promise<EmployeeRead[]> {
    return Api.get<EmployeeRead[]>("/employees/");
  },

  /**
   * Get all employees by branch (requires INSTITUTE_ADMIN, ADMIN, ACADEMIC, or ACCOUNTANT role)
   */
  listByBranch(): Promise<EmployeeRead[]> {
    return Api.get<EmployeeRead[]>("/employees/branch");
  },

  /**
   * Get employee by ID (requires INSTITUTE_ADMIN, ADMIN, ACADEMIC, or ACCOUNTANT role)
   */
  getById(id: number): Promise<EmployeeRead> {
    return Api.get<EmployeeRead>(`/employees/${id}`);
  },

  /**
   * Create new employee (requires INSTITUTE_ADMIN role)
   */
  create(payload: EmployeeCreate): Promise<EmployeeRead> {
    return Api.post<EmployeeRead>("/employees/", payload);
  },

  /**
   * Update employee (requires INSTITUTE_ADMIN role)
   */
  update(id: number, payload: EmployeeUpdate): Promise<EmployeeRead> {
    return Api.put<EmployeeRead>(`/employees/${id}`, payload);
  },

  /**
   * Delete employee (requires INSTITUTE_ADMIN role)
   */
  remove(id: number): Promise<boolean> {
    return Api.delete<boolean>(`/employees/${id}`);
  },

  /**
   * Update employee status only
   */
  updateStatus(id: number, status: string): Promise<EmployeeRead> {
    return Api.put<EmployeeRead>(`/employees/${id}`, { status });
  },
};


