import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BranchesService } from '@/lib/services/general/branches.service';
import type { BranchRead, BranchCreate, BranchUpdate } from '@/lib/types/general/branches';

// Query keys
export const branchKeys = {
  all: ['branches'] as const,
  lists: () => [...branchKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...branchKeys.lists(), { filters }] as const,
  details: () => [...branchKeys.all, 'detail'] as const,
  detail: (id: number) => [...branchKeys.details(), id] as const,
};

// Hooks for fetching data
export const useBranches = () => {
  return useQuery({
    queryKey: branchKeys.lists(),
    queryFn: () => BranchesService.list(),
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
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: BranchCreate) => BranchesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
    },
  });
};

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: BranchUpdate }) => 
      BranchesService.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: branchKeys.detail(id) });
    },
  });
};

export const useDeleteBranch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => BranchesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
    },
  });
};
