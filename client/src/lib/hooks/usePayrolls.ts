import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PayrollsService } from "@/lib/services/payrolls.service";
import type { PayrollRead, PayrollCreate, PayrollUpdate, PayrollQuery, PayrollListResponse } from "@/lib/types/payrolls";

const keys = {
  list: (query?: PayrollQuery) => ["payrolls", query || {}] as const,
  branch: (branch_id: number, query?: PayrollQuery) => ["payrolls", "branch", branch_id, query || {}] as const,
  detail: (id: number) => ["payrolls", id] as const,
};

export function usePayrolls(query?: PayrollQuery) {
  return useQuery<PayrollListResponse>({ queryKey: keys.list(query), queryFn: () => PayrollsService.list(query) });
}

export function usePayrollsByBranch(branch_id: number, query?: PayrollQuery) {
  return useQuery<PayrollListResponse>({ queryKey: keys.branch(branch_id, query), queryFn: () => PayrollsService.listByBranch(branch_id, query), enabled: Number.isFinite(branch_id) });
}

export function usePayroll(id: number) {
  return useQuery<PayrollRead>({ queryKey: keys.detail(id), queryFn: () => PayrollsService.getById(id), enabled: Number.isFinite(id) });
}

export function useCreatePayroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayrollCreate) => PayrollsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payrolls"] });
    },
  });
}

export function useUpdatePayroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PayrollUpdate }) => PayrollsService.update(id, payload),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: keys.detail(v.id) });
      qc.invalidateQueries({ queryKey: ["payrolls"] });
    },
  });
}

export function useUpdatePayrollStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => PayrollsService.updateStatus(id, status),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: keys.detail(v.id) });
      qc.invalidateQueries({ queryKey: ["payrolls"] });
    },
  });
}


