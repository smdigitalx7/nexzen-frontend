export type BranchType = "SCHOOL" | "COLLEGE";

export interface BranchRead {
  branch_id: number;
  institute_id: number;
  branch_name: string;
  branch_type: BranchType;
  branch_address?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface BranchCreate {
  branch_name: string;
  branch_type: BranchType;
  branch_address?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  is_active?: boolean;
}

export type BranchUpdate = BranchCreate;


