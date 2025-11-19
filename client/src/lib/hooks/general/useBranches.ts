import { useQuery, useMutation } from '@tanstack/react-query';
import { BranchesService } from '@/lib/services/general/branches.service';
import type { BranchRead, BranchCreate, BranchUpdate } from '@/lib/types/general/branches';
import { useMutationWithSuccessToast } from '../common/use-mutation-with-toast';
import { useGlobalRefetch } from '../common/useGlobalRefetch';

// Query keys
export const branchKeys = {
  all: ['branches'] as const,
  lists: () => [...branchKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...branchKeys.lists(), { filters }] as const,
  details: () => [...branchKeys.all, 'detail'] as const,
  detail: (id: number) => [...branchKeys.details(), id] as const,
};

// Hooks for fetching data
/**
 * ✅ OPTIMIZATION: Made on-demand - branches are fetched from auth store
 * Only fetch when explicitly needed (e.g., admin branch management)
 */
export const useBranches = () => {
  return useQuery({
    queryKey: branchKeys.lists(),
    queryFn: () => BranchesService.list(),
    enabled: false, // ✅ OPTIMIZATION: On-demand only - branches come from auth store
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};

export const useBranch = (id: number) => {
  return useQuery({
    queryKey: branchKeys.detail(id),
    queryFn: () => BranchesService.getById(id),
    enabled: !!id,
  });
};

// Mutation hooks
export const useCreateBranch = () => {
  const { invalidateEntity } = useGlobalRefetch();
  
  return useMutationWithSuccessToast({
    mutationFn: (data: BranchCreate) => BranchesService.create(data),
    onSuccess: () => {
      invalidateEntity("branches");
    },
  }, "Branch created successfully");
};

export const useUpdateBranch = () => {
  const { invalidateEntity } = useGlobalRefetch();
  
  return useMutationWithSuccessToast({
    mutationFn: ({ id, payload }: { id: number; payload: BranchUpdate }) => 
      BranchesService.update(id, payload),
    onSuccess: () => {
      invalidateEntity("branches");
    },
  }, "Branch updated successfully");
};

export const useDeleteBranch = () => {
  const { invalidateEntity } = useGlobalRefetch();
  
  return useMutationWithSuccessToast({
    mutationFn: (id: number) => BranchesService.remove(id),
    onSuccess: () => {
      invalidateEntity("branches");
    },
  }, "Branch deleted successfully");
};
