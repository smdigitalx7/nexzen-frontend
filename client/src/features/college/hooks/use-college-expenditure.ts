import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeExpenditureService } from "@/features/college/services/expenditure.service";
import type { CollegeExpenditureCreate, CollegeExpenditureRead, CollegeExpenditureUpdate, CollegeExpenditureDashboardStats, CollegeRecentExpenditure } from "@/features/college/types/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";

export function useCollegeExpenditureList(params?: { start_date?: string; end_date?: string }, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: collegeKeys.expenditure.list(params),
    queryFn: () => CollegeExpenditureService.list(params),
    enabled: options?.enabled !== false, // ✅ OPTIMIZATION: Allow disabling for on-demand fetching
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true, // Refetch on mount if enabled and data is stale
    select: (data: any) => (Array.isArray(data) ? data : data.data || []), // Handle both array and paginated response
  });
}

export function useCollegeExpenditure(expenditureId: number | null | undefined) {
  return useQuery({
    queryKey: typeof expenditureId === "number" ? collegeKeys.expenditure.detail(expenditureId) : [...collegeKeys.expenditure.root(), "detail", "nil"],
    queryFn: () => CollegeExpenditureService.getById(expenditureId as number),
    enabled: typeof expenditureId === "number" && expenditureId > 0,
  });
}

export function useCreateCollegeExpenditure() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeExpenditureCreate) => CollegeExpenditureService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.expenditure.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.expenditure.root(), type: 'active' });
    },
  }, "Expenditure record created successfully");
}

export function useUpdateCollegeExpenditure(expenditureId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeExpenditureUpdate) => CollegeExpenditureService.update(expenditureId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.expenditure.detail(expenditureId) });
      void qc.invalidateQueries({ queryKey: collegeKeys.expenditure.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.expenditure.root(), type: 'active' });
    },
  }, "Expenditure record updated successfully");
}

export function useDeleteCollegeExpenditure() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (expenditureId: number) => CollegeExpenditureService.delete(expenditureId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.expenditure.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.expenditure.root(), type: 'active' });
    },
  }, "Expenditure record deleted successfully");
}

export function useCollegeExpenditureDashboard(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...collegeKeys.expenditure.root(), "dashboard"],
    queryFn: () => CollegeExpenditureService.dashboard(),
    enabled: options?.enabled !== false, // ✅ OPTIMIZATION: Allow disabling for on-demand fetching
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true, // Refetch on mount if enabled and data is stale
  });
}

export function useCollegeExpenditureRecent(limit?: number) {
  return useQuery({
    queryKey: [...collegeKeys.expenditure.root(), "recent", limit ?? undefined],
    queryFn: () => CollegeExpenditureService.recent(limit),
  });
}

export function useUpdateCollegeExpenditureStatus(expenditureId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (status: "PENDING" | "APPROVED" | "REJECTED") => 
      CollegeExpenditureService.updateStatus(expenditureId, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.expenditure.detail(expenditureId) });
      void qc.invalidateQueries({ queryKey: collegeKeys.expenditure.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.expenditure.root(), type: 'active' });
    },
  }, "Expenditure status updated successfully");
}