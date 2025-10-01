export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  id: number;
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface RoleResponse {
  id: number;
  name: string;
  description: string | null;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
