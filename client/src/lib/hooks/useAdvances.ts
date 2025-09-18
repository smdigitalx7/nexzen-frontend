import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdvancesService } from "@/lib/services/advances.service";
import type { AdvanceRead, AdvanceCreate, AdvanceUpdate } from "@/lib/types/advances";

const keys = {
  all: ["advances", "all"] as const,
  branch: ["advances", "branch"] as const,
  detail: (id: number) => ["advances", id] as const,
};

export function useAdvancesAll() {
  return useQuery<AdvanceRead[]>({ queryKey: keys.all, queryFn: () => AdvancesService.list() });
}

export function useAdvancesByBranch() {
  return useQuery<AdvanceRead[]>({ queryKey: keys.branch, queryFn: () => AdvancesService.listByBranch() });
}

export function useAdvance(id: number) {
  return useQuery<AdvanceRead>({ queryKey: keys.detail(id), queryFn: () => AdvancesService.getById(id), enabled: Number.isFinite(id) });
}

export function useCreateAdvance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdvanceCreate) => AdvancesService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.branch });
    },
  });
}

export function useUpdateAdvance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AdvanceUpdate }) => AdvancesService.update(id, payload),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.branch });
      qc.invalidateQueries({ queryKey: keys.detail(v.id) });
    },
  });
}

export function useUpdateAdvanceStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => AdvancesService.updateStatus(id, status),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.branch });
      qc.invalidateQueries({ queryKey: keys.detail(v.id) });
    },
  });
}

export function useUpdateAdvanceAmountPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount_paid }: { id: number; amount_paid: number }) => AdvancesService.updateAmountPaid(id, amount_paid),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.branch });
      qc.invalidateQueries({ queryKey: keys.detail(v.id) });
    },
  });
}


