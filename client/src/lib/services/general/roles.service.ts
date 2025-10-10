import { Api } from "@/lib/api";
import type { RoleRead, RoleUpdate } from "@/lib/types/general/roles";

/**
 * RolesService - Handles all role-related API operations
 * 
 * Required roles for most operations: INSTITUTE_ADMIN, ADMIN
 * 
 * Available endpoints:
 * - GET /roles/ - List all roles (INSTITUTE_ADMIN, ADMIN)
 * - GET /roles/{id} - Get role by ID (INSTITUTE_ADMIN, ADMIN)
 * - PUT /roles/{id} - Update role (INSTITUTE_ADMIN)
 */
export const RolesService = {
  /**
   * Get all roles in the institute
   * @returns Promise<RoleRead[]> - List of all roles
   */
  list(): Promise<RoleRead[]> {
    return Api.get<RoleRead[]>("/roles");
  },

  /**
   * Get a specific role by ID
   * @param id - Role ID
   * @returns Promise<RoleRead> - Role details
   */
  getById(id: number): Promise<RoleRead> {
    return Api.get<RoleRead>(`/roles/${id}`);
  },

  /**
   * Update an existing role
   * @param id - Role ID
   * @param payload - Role update data
   * @returns Promise<{ message: string }> - Success message
   */
  update(id: number, payload: RoleUpdate): Promise<{ message: string }> {
    return Api.put<{ message: string }>(`/roles/${id}`, payload);
  },
};


