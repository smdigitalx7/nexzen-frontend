import { useQuery } from '@tanstack/react-query';
import { RolesService } from '@/lib/services/general/roles.service';
import type { RoleUpdate } from '@/lib/types/general/roles';
import { useMutationWithSuccessToast } from '../common/use-mutation-with-toast';
import { useGlobalRefetch } from '../common/useGlobalRefetch';

// Query keys
export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...roleKeys.lists(), { filters }] as const,
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
  const { invalidateEntity } = useGlobalRefetch();
  
  return useMutationWithSuccessToast({
    mutationFn: ({ id, payload }: { id: number; payload: RoleUpdate }) => 
      RolesService.update(id, payload),
    onSuccess: () => {
      invalidateEntity("roles");
    },
  }, "Role updated successfully");
};
