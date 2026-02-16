import { Api } from "@/core/api";
import type { UserRead, UserCreate, UserUpdate, UserWithRolesAndBranches, UserWithAccesses, UserDashboardStats, PaginatedUsersWithRolesAndBranches } from "@/features/general/types/users";

/**
 * UsersService - Handles all user-related API operations
 * 
 * Required roles for most operations: INSTITUTE_ADMIN, ADMIN
 * 
 * Available endpoints:
 * - GET /users/dashboard - Get user dashboard statistics (INSTITUTE_ADMIN, ADMIN)
 * - GET /users/ - List all users (INSTITUTE_ADMIN, ADMIN)
 * - GET /users/roles-and-branches - Get users with roles and branches (INSTITUTE_ADMIN, ADMIN)
 * - GET /users/{id} - Get user by ID (INSTITUTE_ADMIN, ADMIN)
 * - POST /users/ - Create new user (INSTITUTE_ADMIN, ADMIN)
 * - PUT /users/{id} - Update user (INSTITUTE_ADMIN, ADMIN)
 * - DELETE /users/{id} - Delete user (INSTITUTE_ADMIN, ADMIN)
 */
export const UsersService = {
  /**
   * Get user dashboard statistics
   * @returns Promise<UserDashboardStats> - Dashboard statistics
   */
  getDashboard(): Promise<UserDashboardStats> {
    return Api.get<UserDashboardStats>("/users/dashboard");
  },

  /**
   * Get all users in the institute
   * @param params - Optional pagination and filter parameters
   * @returns Promise<UserRead[]> - List of all users
   */
  list(params?: { page?: number; page_size?: number; is_active?: boolean | null }): Promise<UserRead[]> {
    return Api.get<UserRead[]>("/users", params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  /**
   * Get all users with their roles and branches
   * @param params - Optional pagination and filter parameters
   * @returns Promise<PaginatedUsersWithRolesAndBranches> - Paginated list of users with detailed role and branch information
   */
  listWithRolesAndBranches(params?: { page?: number; page_size?: number; is_active?: boolean | null }): Promise<PaginatedUsersWithRolesAndBranches> {
    return Api.get<PaginatedUsersWithRolesAndBranches>("/users/roles-and-branches", params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  /**
   * Get a specific user by ID
   * @param id - User ID
   * @returns Promise<UserWithAccesses> - User details with accesses
   */
  getById(id: number): Promise<UserWithAccesses> {
    return Api.get<UserWithAccesses>(`/users/${id}`);
  },

  /**
   * Create a new user
   * @param payload - User creation data (includes password and confirm_password)
   * @returns Promise<UserRead> - Created user details
   */
  create(payload: UserCreate): Promise<UserRead> {
    return Api.post<UserRead>("/users", payload);
  },

  /**
   * Update an existing user
   * @param id - User ID
   * @param payload - User update data
   * @returns Promise<UserRead> - Updated user details
   */
  update(id: number, payload: UserUpdate): Promise<UserRead> {
    return Api.put<UserRead>(`/users/${id}`, payload);
  },

  /**
   * Update user status
   * @param id - User ID
   * @param is_active - User status
   * @returns Promise<UserRead> - Updated user details
   */
  updateStatus(id: number, is_active: boolean): Promise<UserRead> {
    return Api.patch<UserRead>(`/users/${id}/status`, { is_active });
  },

  /**
   * Delete a user
   * @param id - User ID
   * @returns Promise<UserRead> - Deleted user details
   */
  remove(id: number): Promise<UserRead> {
    return Api.delete<UserRead>(`/users/${id}`);
  },

  /**
   * Create user branch access
   * @param payload - Access creation data with user_id, branch_id, role_id, etc.
   * @returns Promise<any> - Created access response
   */
  createAccess(payload: { user_id: number; branch_id: number; role_id: number; is_default?: boolean; access_notes?: string; is_active?: boolean }): Promise<any> {
    return Api.post(`/user-branch-accesses`, payload);
  },

  /**
   * Revoke user branch access
   * @param accessId - Access ID
   * @param payload - Revoke data with user_id and access_notes
   * @returns Promise<any> - Revoke response
   */
  revokeAccess(accessId: number, payload: { user_id: number; access_notes?: string }): Promise<any> {
    return Api.put(`/user-branch-accesses/revoke/${accessId}`, payload);
  },
};


