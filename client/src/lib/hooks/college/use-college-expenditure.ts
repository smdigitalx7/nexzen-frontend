import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeExpenditureService } from "@/lib/services/college/expenditure.service";
import type { CollegeExpenditureCreate, CollegeExpenditureRead, CollegeExpenditureUpdate, CollegeExpenditureDashboardStats, CollegeRecentExpenditure } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";

export function useCollegeExpenditureList(params?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: collegeKeys.expenditure.list(params),
    queryFn: () => CollegeExpenditureService.list(params) as Promise<CollegeExpenditureRead[]>,
  });
}

export function useCollegeExpenditure(expenditureId: number | null | undefined) {
  return useQuery({
    queryKey: typeof expenditureId === "number" ? collegeKeys.expenditure.detail(expenditureId) : [...collegeKeys.expenditure.root(), "detail", "nil"],
    queryFn: () => CollegeExpenditureService.getById(expenditureId as number) as Promise<CollegeExpenditureRead>,
    enabled: typeof expenditureId === "number" && expenditureId > 0,
  });
}

export function useCreateCollegeExpenditure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeExpenditureCreate) => CollegeExpenditureService.create(payload) as Promise<CollegeExpenditureRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.expenditure.root() });
    },
  });
}

export function useUpdateCollegeExpenditure(expenditureId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeExpenditureUpdate) => CollegeExpenditureService.update(expenditureId, payload) as Promise<CollegeExpenditureRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.expenditure.detail(expenditureId) });
      qc.invalidateQueries({ queryKey: collegeKeys.expenditure.root() });
    },
  });
}

export function useDeleteCollegeExpenditure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (expenditureId: number) => CollegeExpenditureService.delete(expenditureId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.expenditure.root() });
    },
  });
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
