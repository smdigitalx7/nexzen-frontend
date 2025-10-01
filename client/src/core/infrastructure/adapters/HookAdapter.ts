/**
 * Hook Adapter - Provides clean architecture hooks
 * All hooks now use the new ServiceLocator-based implementation
 */

// Import clean architecture hooks
import {
  useUsers,
  useUsersWithRoles,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useUpdateUserStatus
} from '@/lib/hooks/useUsers';

// Re-export clean architecture hooks
export {
  useUsers,
  useUsersWithRoles,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useUpdateUserStatus
};

/**
 * Smart hook aliases - These are now just aliases to the clean architecture hooks
 * since we've completed the migration
 */
export const useSmartUsers = useUsers;
export const useSmartUsersWithRoles = useUsersWithRoles;
export const useSmartUser = useUser;
export const useSmartCreateUser = useCreateUser;
export const useSmartUpdateUser = useUpdateUser;
export const useSmartDeleteUser = useDeleteUser;
export const useSmartUpdateUserStatus = useUpdateUserStatus;
