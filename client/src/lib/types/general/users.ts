export interface UserRead {
  user_id: number;
  full_name: string;
  email: string;
  mobile_no?: string | null;
  is_institute_admin: boolean;
  is_active: boolean;
  institute_id: number;
  created_at: string; // ISO date string
  updated_at?: string | null; // ISO date string
  created_by?: number | null;
  updated_by?: number | null;
}

export interface UserCreate {
  full_name: string;
  email: string;
  mobile_no?: string | null;
  password: string;
  confirm_password: string;
  is_institute_admin?: boolean;
  is_active?: boolean;
}

export interface UserUpdate {
  full_name?: string;
  email?: string;
  mobile_no?: string | null;
  is_institute_admin?: boolean;
  is_active?: boolean;
}

// Role and Branch interfaces for detailed user information
export interface RoleInfo {
  role_id: number;
  role_name: string;
  display_name: string;
}

export interface BranchInfo {
  branch_id: number;
  branch_name: string;
  branch_type: string;
}

export interface UserWithRolesAndBranches extends UserRead {
  roles: RoleInfo[];
  branches: BranchInfo[];
}

// Dashboard schemas
export interface UserDashboardStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  institute_admins: number;
  regular_users: number;
  users_created_this_month: number;
  users_created_this_year: number;
}


