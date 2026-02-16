export interface UserAccess {
  access_id: number;
  role_name: string;
  branch_name: string;
  is_default?: boolean;
  access_notes?: string;
  is_active?: boolean;
}

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
  accesses?: UserAccess[];
}

export interface BranchRoleAssignment {
  branch_id: number;
  role_id: number;
  is_default?: boolean;
  access_notes?: string;
}

export interface UserCreate {
  full_name: string;
  email: string;
  mobile_no?: string | null;
  password: string;
  confirm_password: string;
  is_institute_admin?: boolean;
  is_active?: boolean;
  branch_role_assignments: BranchRoleAssignment[];
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

export interface PaginatedUsersWithRolesAndBranches {
  data: UserWithRolesAndBranches[];
  total_count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
}

// New interface that matches the API response structure
export interface UserWithAccesses extends UserRead {
  accesses: UserAccess[];
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


