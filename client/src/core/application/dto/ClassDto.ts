export interface CreateClassRequest {
  name: string;
  description?: string;
  branchId: number;
}

export interface UpdateClassRequest {
  id: number;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface ClassResponse {
  id: number;
  name: string;
  description: string | null;
  branchId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
