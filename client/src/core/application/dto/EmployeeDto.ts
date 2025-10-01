import { EmployeeStatus } from '../../domain/entities/Employee';

export interface CreateEmployeeRequest {
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  phoneNumber?: string;
}

export interface UpdateEmployeeRequest {
  fullName?: string;
  email?: string;
  department?: string;
  position?: string;
  salary?: number;
  phoneNumber?: string;
  status?: EmployeeStatus;
}

export interface EmployeeResponse {
  id: number;
  employeeId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  department: string;
  position: string;
  salary: number;
  status: EmployeeStatus;
  hireDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeListResponse {
  employees: EmployeeResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface EmployeeStatisticsResponse {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  terminatedEmployees: number;
  employeesByDepartment: Record<string, number>;
  employeesByStatus: Record<EmployeeStatus, number>;
}
