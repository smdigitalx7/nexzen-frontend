import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeIncomeService } from "@/lib/services/college/income.service";
import type { CollegeIncomeCreate, CollegeIncomeCreateReservation, CollegeIncomeRead, CollegeIncomeUpdate, CollegeIncomeDashboardStats, CollegeRecentIncome, CollegeFinanceReport, CollegeFinanceReportParams } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";

export function useCollegeIncomeList(params?: { admission_no?: string; purpose?: string; start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: collegeKeys.income.list(params),
    queryFn: () => CollegeIncomeService.list(params) as Promise<CollegeIncomeRead[]>,
  });
}

export function useCollegeIncome(incomeId: number | null | undefined) {
  return useQuery({
    queryKey: typeof incomeId === "number" ? collegeKeys.income.detail(incomeId) : [...collegeKeys.income.root(), "detail", "nil"],
    queryFn: () => CollegeIncomeService.getById(incomeId as number) as Promise<CollegeIncomeRead>,
    enabled: typeof incomeId === "number" && incomeId > 0,
  });
}

export function useCreateCollegeIncomeByAdmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { admission_no: string; payload: CollegeIncomeCreate }) =>
      CollegeIncomeService.createByAdmission(input.admission_no, input.payload) as Promise<CollegeIncomeRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.income.root() });
    },
  });
}

export function useUpdateCollegeIncome(incomeId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeIncomeUpdate) => CollegeIncomeService.update(incomeId, payload) as Promise<CollegeIncomeRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.income.detail(incomeId) });
      qc.invalidateQueries({ queryKey: collegeKeys.income.root() });
    },
  });
}

export function useCreateCollegeIncomeByReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeIncomeCreateReservation) => CollegeIncomeService.createByReservation(payload) as Promise<CollegeIncomeRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.income.root() });
    },
  });
}

export function useCollegeIncomeDashboard() {
  return useQuery({
    queryKey: [...collegeKeys.income.root(), "dashboard"],
    queryFn: () => CollegeIncomeService.dashboard(),
  });
}

export function useCollegeIncomeRecent(limit?: number) {
  return useQuery({
    queryKey: [...collegeKeys.income.root(), "recent", { limit }],
    queryFn: () => CollegeIncomeService.recent(limit),
  });
}

export function useCollegeFinanceReport(params?: CollegeFinanceReportParams) {
  return useQuery({
    queryKey: [...collegeKeys.income.root(), "finance-report", params],
    queryFn: () => CollegeIncomeService.getFinanceReport(params) as Promise<CollegeFinanceReport[]>,
    enabled: true, // Always enabled since params are optional
  });
}
