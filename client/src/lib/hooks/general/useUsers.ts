import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UsersService } from '@/lib/services/general/users.service';
import type { 
  UserRead, 
  UserCreate, 
  UserUpdate, 
  UserWithRolesAndBranches,
  UserDashboardStats 
} from '@/lib/types/general/users';

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
  
  return useMutation({
    mutationFn: (data: UserCreate) => UsersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.dashboard() });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UserUpdate }) => 
      UsersService.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.dashboard() });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => UsersService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.dashboard() });
    },
  });
};
