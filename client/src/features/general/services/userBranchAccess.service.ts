import { Api } from "@/core/api";
import type { UserBranchAccessRead, UserBranchAccessCreate, UserBranchRevoke } from "@/features/general/types/userBranchAccess";

/**
 * UserBranchAccessService - Handles all user branch access related API operations
 * 
 * Required roles for most operations: INSTITUTE_ADMIN, ADMIN
 * 
 * Available endpoints:
 * - GET /user-branch-accesses/ - List user branch accesses (INSTITUTE_ADMIN, ADMIN)
 * - GET /user-branch-accesses/{id}/ - Get user branch access by ID (INSTITUTE_ADMIN, ADMIN, ACADEMIC, ACCOUNTANT)
 * - POST /user-branch-accesses/ - Create user branch access (INSTITUTE_ADMIN, ADMIN)
 * - PUT /user-branch-accesses/revoke/{id} - Revoke user branch access (INSTITUTE_ADMIN, ADMIN)
 */
export const UserBranchAccessService = {
  /**
   * Get all user branch accesses in the institute
   * @returns Promise<UserBranchAccessRead[]> - List of all user branch accesses
   */
  list(): Promise<UserBranchAccessRead[]> {
    console.log("API: Calling /user-branch-accesses/ endpoint");
    return Api.get<UserBranchAccessRead[]>("/user-branch-accesses");
  },

  /**
   * Get a specific user branch access by ID
   * @param id - User branch access ID
   * @returns Promise<UserBranchAccessRead> - User branch access details
   */
  getById(id: number): Promise<UserBranchAccessRead> {
    console.log(`API: Calling /user-branch-accesses/${id}/ endpoint`);
    return Api.get<UserBranchAccessRead>(`/user-branch-accesses/${id}/`);
  },

  /**
   * Create a new user branch access
   * @param payload - User branch access creation data
   * @returns Promise<UserBranchAccessRead> - Created user branch access details
   */
  create(payload: UserBranchAccessCreate): Promise<UserBranchAccessRead> {
    console.log("API: Creating new user branch access");
    return Api.post<UserBranchAccessRead>("/user-branch-accesses", payload);
  },

  /**
   * Revoke a user branch access
   * @param id - User branch access ID
   * @param payload - Revocation data
   * @returns Promise<UserBranchAccessRead> - Updated user branch access details
   */
  revoke(id: number, payload: UserBranchRevoke): Promise<UserBranchAccessRead> {
    console.log(`API: Revoking user branch access ${id}`);
    return Api.put<UserBranchAccessRead>(`/user-branch-accesses/revoke/${id}`, payload);
  },
};
