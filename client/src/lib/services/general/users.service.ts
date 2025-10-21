import { Api } from "@/lib/api";
import type { UserRead, UserCreate, UserUpdate, UserWithRolesAndBranches, UserWithAccesses, UserDashboardStats } from "@/lib/types/general/users";

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
    console.log("API: Calling /users/dashboard endpoint");
    return Api.get<UserDashboardStats>("/users/dashboard");
  },

  /**
   * Get all users in the institute
   * @returns Promise<UserRead[]> - List of all users
   */
  list(): Promise<UserRead[]> {
    console.log("API: Calling /users/ endpoint");
    return Api.get<UserRead[]>("/users");
  },

  /**
   * Get all users with their roles and branches
   * @returns Promise<UserWithRolesAndBranches[]> - List of all users with detailed role and branch information
   */
  listWithRolesAndBranches(): Promise<UserWithRolesAndBranches[]> {
    console.log("API: Calling /users/roles-and-branches endpoint");
    return Api.get<UserWithRolesAndBranches[]>("/users/roles-and-branches");
  },

  /**
   * Get a specific user by ID
   * @param id - User ID
   * @returns Promise<UserWithAccesses> - User details with accesses
   */
  getById(id: number): Promise<UserWithAccesses> {
    console.log(`API: Calling /users/${id} endpoint`);
    return Api.get<UserWithAccesses>(`/users/${id}`);
  },

  /**
   * Create a new user
   * @param payload - User creation data (includes password and confirm_password)
   * @returns Promise<UserRead> - Created user details
   */
  create(payload: UserCreate): Promise<UserRead> {
    console.log("API: Creating new user");
    return Api.post<UserRead>("/users", payload);
  },

  /**
   * Update an existing user
   * @param id - User ID
   * @param payload - User update data
   * @returns Promise<UserRead> - Updated user details
   */
  update(id: number, payload: UserUpdate): Promise<UserRead> {
    console.log(`API: Updating user ${id}`);
    return Api.put<UserRead>(`/users/${id}`, payload);
  },

  /**
   * Delete a user
   * @param id - User ID
   * @returns Promise<UserRead> - Deleted user details
   */
  remove(id: number): Promise<UserRead> {
    console.log(`API: Deleting user ${id}`);
    return Api.delete<UserRead>(`/users/${id}`);
  },

  /**
   * Revoke user branch access
   * @param accessId - Access ID
   * @param payload - Revoke data with user_id and access_notes
   * @returns Promise<any> - Revoke response
   */
  revokeAccess(accessId: number, payload: { user_id: number; access_notes?: string }): Promise<any> {
    console.log(`API: Revoking access ${accessId} for user ${payload.user_id}`);
    return Api.put(`/user-branch-accesses/revoke/${accessId}`, payload);
  },
};


