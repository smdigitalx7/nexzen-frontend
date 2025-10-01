export interface CreateBranchRequest {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  branchType: string;
}

export interface UpdateBranchRequest {
  id: number;
  name?: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  branchType?: string;
  isActive?: boolean;
}

export interface BranchResponse {
  id: number;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  branchType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
