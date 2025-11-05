import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeExpenditureService } from "@/lib/services/college/expenditure.service";
import type { CollegeExpenditureCreate, CollegeExpenditureRead, CollegeExpenditureUpdate, CollegeExpenditureDashboardStats, CollegeRecentExpenditure } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useCollegeExpenditureList(params?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: collegeKeys.expenditure.list(params),
    queryFn: () => CollegeExpenditureService.list(params),
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
      qc.invalidateQueries({ queryKey: collegeKeys.expenditure.root() });
    },
  }, "Expenditure record created successfully");
}

export function useUpdateCollegeExpenditure(expenditureId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeExpenditureUpdate) => CollegeExpenditureService.update(expenditureId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.expenditure.detail(expenditureId) });
      qc.invalidateQueries({ queryKey: collegeKeys.expenditure.root() });
    },
  }, "Expenditure record updated successfully");
}

export function useDeleteCollegeExpenditure() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (expenditureId: number) => CollegeExpenditureService.delete(expenditureId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.expenditure.root() });
    },
  }, "Expenditure record deleted successfully");
}

export function useCollegeExpenditureDashboard() {
  return useQuery({
    queryKey: [...collegeKeys.expenditure.root(), "dashboard"],
    queryFn: () => CollegeExpenditureService.dashboard(),
  });
}

export function useCollegeExpenditureRecent(limit?: number) {
  return useQuery({
    queryKey: [...collegeKeys.expenditure.root(), "recent", { limit }],
    queryFn: () => CollegeExpenditureService.recent(limit),
  });
}
