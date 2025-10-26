import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RolesService } from '@/lib/services/general/roles.service';
import type { RoleRead, RoleUpdate } from '@/lib/types/general/roles';
import { useMutationWithSuccessToast } from '../common/use-mutation-with-toast';

// Query keys
export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...roleKeys.lists(), { filters }] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: number) => [...roleKeys.details(), id] as const,
};

// Hooks for fetching data
export const useRoles = () => {
  return useQuery({
    queryKey: roleKeys.lists(),
    queryFn: () => RolesService.list(),
  });
};

export const useRole = (id: number) => {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => RolesService.getById(id),
    enabled: !!id,
  });
};

// Mutation hooks
export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutationWithSuccessToast({
    mutationFn: ({ id, payload }: { id: number; payload: RoleUpdate }) => 
      RolesService.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
    },
  }, "Role updated successfully");
};
