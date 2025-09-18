import { Api } from "@/lib/api";
import type { UserRead, UserCreate, UserUpdate } from "@/lib/types/users";

/**
 * UsersService - Handles all user-related API operations
 * 
 * Required roles for most operations: INSTITUTE_ADMIN, ADMIN
 * 
 * Available endpoints:
 * - GET /users/ - List all users (INSTITUTE_ADMIN, ADMIN)
 * - GET /users/{id} - Get user by ID (INSTITUTE_ADMIN, ADMIN)
 * - POST /users/ - Create new user (INSTITUTE_ADMIN, ADMIN)
 * - PUT /users/{id} - Update user (INSTITUTE_ADMIN, ADMIN)
 * - DELETE /users/{id} - Delete user (INSTITUTE_ADMIN, ADMIN)
 */
export const UsersService = {
  /**
   * Get all users in the institute
   * @returns Promise<UserRead[]> - List of all users
   */
  list(): Promise<UserRead[]> {
    console.log("API: Calling /users/ endpoint");
    return Api.get<UserRead[]>("/users/");
  },

  /**
   * Get a specific user by ID
   * @param id - User ID
   * @returns Promise<UserRead> - User details
   */
  getById(id: number): Promise<UserRead> {
    console.log(`API: Calling /users/${id} endpoint`);
    return Api.get<UserRead>(`/users/${id}`);
  },

  /**
   * Create a new user
   * @param payload - User creation data (includes password and confirm_password)
   * @returns Promise<UserRead> - Created user details
   */
  create(payload: UserCreate): Promise<UserRead> {
    console.log("API: Creating new user");
    return Api.post<UserRead>("/users/", payload);
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
};


