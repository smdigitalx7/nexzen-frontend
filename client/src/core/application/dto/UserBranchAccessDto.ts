export interface CreateUserBranchAccessRequest {
  userId: number;
  branchId: number;
  roleId: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface UpdateUserBranchAccessRequest {
  id: number;
  roleId?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface UserBranchAccessResponse {
  id: number;
  userId: number;
  branchId: number;
  roleId: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RevokeUserBranchAccessRequest {
  id: number;
}
