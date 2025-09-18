import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BranchesService } from "@/lib/services/branches.service";
import type { BranchRead, BranchCreate, BranchUpdate } from "@/lib/types/branches";

const keys = {
  all: ["branches"] as const,
  detail: (id: number) => ["branches", id] as const,
};

export function useBranches() {
  return useQuery<BranchRead[]>({
    queryKey: keys.all,
    queryFn: () => BranchesService.list(),
  });
}

export function useBranch(id: number) {
  return useQuery<BranchRead>({
    queryKey: keys.detail(id),
    queryFn: () => BranchesService.getById(id),
    enabled: Number.isFinite(id),
  });
}

export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BranchCreate) => BranchesService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useUpdateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: BranchUpdate }) => BranchesService.update(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.detail(variables.id) });
    },
  });
}

export function useDeleteBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => BranchesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}


