import type { UserRole } from "@/lib/constants";

/**
 * Auth-related type definitions
 * Extracted from authStore.ts for better organization
 */
export interface AuthUser {
  user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  institute_id: string;
  current_branch_id: number;
  avatar?: string;
}

export interface Branch {
  branch_id: number;
  branch_name: string;
  branch_type: "SCHOOL" | "COLLEGE";
  is_default?: boolean;
  roles?: string[]; // Roles for this branch
}

export interface AcademicYear {
  academic_year_id: number;
  year_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  created_by: number | null;
  updated_by: number | null;
}

export interface AuthError {
  code: string;
  message: string;
  timestamp: number;
}

