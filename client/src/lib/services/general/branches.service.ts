import { Api } from "@/lib/api";
import type { BranchRead, BranchCreate, BranchUpdate } from "@/lib/types/general/branches";

/**
 * BranchesService - Handles all branch-related API operations
 * 
 * Required roles for most operations: INSTITUTE_ADMIN, ADMIN, ACADEMIC, ACCOUNTANT
 * 
 * Available endpoints:
 * - GET /branches - List all branches (INSTITUTE_ADMIN, ADMIN, ACADEMIC, ACCOUNTANT)
 * - GET /branches/{id} - Get branch by ID (INSTITUTE_ADMIN, ADMIN, ACADEMIC, ACCOUNTANT)
 * - POST /branches - Create new branch (INSTITUTE_ADMIN)
 * - PUT /branches/{id} - Update branch (INSTITUTE_ADMIN, ADMIN)
 * - DELETE /branches/{id} - Delete branch (INSTITUTE_ADMIN)
 */
export const BranchesService = {
  /**
   * Get all branches in the institute
   * @returns Promise<BranchRead[]> - List of all branches
   */
  list(): Promise<BranchRead[]> {
    return Api.get<BranchRead[]>("/branches");
  },

  /**
   * Get a specific branch by ID
   * @param id - Branch ID
   * @returns Promise<BranchRead> - Branch details
   */
  getById(id: number): Promise<BranchRead> {
    return Api.get<BranchRead>(`/branches/${id}`);
  },

  /**
   * Create a new branch
   * @param payload - Branch creation data
   * @returns Promise<BranchRead> - Created branch details
   */
  create(payload: BranchCreate): Promise<BranchRead> {
    return Api.post<BranchRead>("/branches", payload);
  },

  /**
   * Update an existing branch
   * @param id - Branch ID
   * @param payload - Branch update data
   * @returns Promise<BranchUpdate> - Updated branch details
   */
  update(id: number, payload: BranchUpdate): Promise<BranchUpdate> {
    return Api.put<BranchUpdate>(`/branches/${id}`, payload);
  },

  /**
   * Delete a branch
   * @param id - Branch ID
   * @returns Promise<boolean> - Success status
   */
  remove(id: number): Promise<boolean> {
    return Api.delete<boolean>(`/branches/${id}`);
  },
};


