export interface UserBranchAccessRead {
  access_id: number;
  user_id: number;
  institute_id: number;
  branch_id: number;
  role_id: number;
  granted_by?: number | null;
  revoked_by?: number | null;
  access_notes?: string | null;
  granted_at: string; // ISO date string
  revoked_at?: string | null; // ISO date string
  created_at: string; // ISO date string
  updated_at?: string | null; // ISO date string
  is_default: boolean;
  is_active: boolean;
  // Related data
  branch?: {
    branch_id: number;
    branch_name: string;
    branch_type: string;
  };
  role?: {
    role_id: number;
    role_name: string;
    display_name: string;
  };
  user?: {
    user_id: number;
    full_name: string;
    email: string;
  };
}

export interface UserBranchAccessCreate {
  user_id: number;
  branch_id: number;
  role_id: number;
  is_default?: boolean;
  access_notes?: string | null;
  is_active?: boolean;
}

export interface UserBranchRevoke {
  user_id: number;
  access_notes?: string | null;
}
