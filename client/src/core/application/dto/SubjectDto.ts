export interface CreateSubjectRequest {
  name: string;
  code: string;
  description?: string;
  branchId: number;
}

export interface UpdateSubjectRequest {
  id: number;
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface SubjectResponse {
  id: number;
  name: string;
  code: string;
  description: string | null;
  branchId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
