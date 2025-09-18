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


