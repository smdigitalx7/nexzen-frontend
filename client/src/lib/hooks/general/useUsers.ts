import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UsersService } from '@/lib/services/general/users.service';
import type { 
  UserRead, 
  UserCreate, 
  UserUpdate, 
  UserWithRolesAndBranches,
  UserWithAccesses,
  UserDashboardStats 
} from '@/lib/types/general/users';
import { useMutationWithSuccessToast } from '../common/use-mutation-with-toast';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
  dashboard: () => [...userKeys.all, 'dashboard'] as const,
  rolesAndBranches: () => [...userKeys.all, 'roles-and-branches'] as const,
};

// Hooks for fetching data
export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: () => UsersService.list(),
  });
};

export const useUser = (id: number) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => UsersService.getById(id),
    enabled: !!id,
  });
};

export const useUsersWithRolesAndBranches = () => {
  return useQuery({
    queryKey: userKeys.rolesAndBranches(),
    queryFn: () => UsersService.listWithRolesAndBranches(),
  });
};

export const useUserDashboard = () => {
  return useQuery({
    queryKey: userKeys.dashboard(),
    queryFn: () => UsersService.getDashboard(),
  });
};

// Mutation hooks
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutationWithSuccessToast({
    mutationFn: (data: UserCreate) => UsersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.rolesAndBranches() });
      queryClient.invalidateQueries({ queryKey: userKeys.dashboard() });
    },
  }, "User created successfully");
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutationWithSuccessToast({
    mutationFn: ({ id, payload }: { id: number; payload: UserUpdate }) => 
      UsersService.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.rolesAndBranches() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.dashboard() });
    },
  }, "User updated successfully");
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutationWithSuccessToast({
    mutationFn: (id: number) => UsersService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.rolesAndBranches() });
      queryClient.invalidateQueries({ queryKey: userKeys.dashboard() });
    },
  }, "User deleted successfully");
};

export const useCreateUserAccess = () => {
  const queryClient = useQueryClient();
  
  return useMutationWithSuccessToast({
    mutationFn: (payload: { user_id: number; branch_id: number; role_id: number; is_default?: boolean; access_notes?: string; is_active?: boolean }) => 
      UsersService.createAccess(payload),
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.rolesAndBranches() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(payload.user_id) });
      queryClient.invalidateQueries({ queryKey: userKeys.dashboard() });
    },
  }, "Access granted successfully");
};

export const useRevokeUserAccess = () => {
  const queryClient = useQueryClient();
  
  return useMutationWithSuccessToast({
    mutationFn: ({ accessId, payload }: { accessId: number; payload: { user_id: number; access_notes?: string } }) => 
      UsersService.revokeAccess(accessId, payload),
    onSuccess: (_, { payload }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.rolesAndBranches() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(payload.user_id) });
      queryClient.invalidateQueries({ queryKey: userKeys.dashboard() });
    },
  }, "Access revoked successfully");
};
