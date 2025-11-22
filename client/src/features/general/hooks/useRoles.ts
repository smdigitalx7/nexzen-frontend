import { useQuery } from '@tanstack/react-query';
import { RolesService } from '@/features/general/services/roles.service';
import type { RoleUpdate } from '@/features/general/types/roles';
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";
import { useGlobalRefetch } from "@/common/hooks/useGlobalRefetch";

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
