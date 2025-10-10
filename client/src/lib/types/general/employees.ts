export interface EmployeeRead {
  employee_id: number;
  institute_id: number;
  employee_name: string;
  employee_type: string;
  employee_code: string;
  aadhar_no?: string | null;
  mobile_no?: string | null;
  email?: string | null;
  address?: string | null;
  date_of_joining: string; // ISO date string
  designation: string;
  qualification?: string | null;
  experience_years?: number | null;
  status: string;
  salary: number;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface EmployeeCreate {
  employee_name: string;
  employee_type: string;
  employee_code: string;
  aadhar_no?: string | null;
  mobile_no?: string | null;
  email?: string | null;
  address?: string | null;
  date_of_joining: string; // ISO date string
  designation: string;
  qualification?: string | null;
  experience_years?: number | null;
  status: string;
  salary: number;
}

export interface EmployeeUpdate {
  employee_name?: string;
  employee_type?: string;
  employee_code?: string;
  aadhar_no?: string | null;
  mobile_no?: string | null;
  email?: string | null;
  address?: string | null;
  date_of_joining?: string; // ISO date string
  designation?: string;
  qualification?: string | null;
  experience_years?: number | null;
  status?: string;
  salary?: number;
}

// Additional employee interfaces for detailed information
export interface EmployeeBranchInfo {
  branch_id: number;
  branch_name: string;
  branch_type: string;
  assignment_date: string;
  end_date?: string | null;
  is_active: boolean;
}

export interface EmployeeWithBranches extends EmployeeRead {
  branches: EmployeeBranchInfo[];
}

export interface TeacherByBranch {
  employee_id: number;
  employee_name: string;
}

// Dashboard schemas
export interface RecentEmployee {
  employee_id: number;
  employee_name: string;
  employee_type: string;
  designation: string;
  date_of_joining: string;
  status: string;
}

export interface EmployeeDashboardStats {
  total_employees: number;
  active_employees: number;
  terminated_employees: number;
  teaching_staff: number;
  non_teaching_staff: number;
  office_staff: number;
  drivers: number;
  employees_joined_this_month: number;
  employees_joined_this_year: number;
  total_salary_expense: number;
}


