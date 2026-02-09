import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeIncomeService } from "@/features/college/services/income.service";
import type { CollegeIncomeCreate, CollegeIncomeCreateReservation, CollegeIncomeRead, CollegeIncomeUpdate, CollegeIncomeDashboardStats, CollegeRecentIncome, CollegeFinanceReport, CollegeFinanceReportParams, CollegeIncomeSummaryParams } from "@/features/college/types/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";

export function useCollegeIncomeList(params?: { admission_no?: string; purpose?: string; start_date?: string; end_date?: string; page?: number; page_size?: number; search?: string | null }, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: collegeKeys.income.list(params as Record<string, unknown> | undefined),
    queryFn: () => CollegeIncomeService.list(params),
    enabled: options?.enabled !== false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
    // Return raw response so callers can use both data and total_count (no select)
  });
}

export function useCollegeIncome(incomeId: number | null | undefined) {
  return useQuery({
    queryKey: typeof incomeId === "number" ? collegeKeys.income.detail(incomeId) : [...collegeKeys.income.root(), "detail", "nil"],
    queryFn: () => CollegeIncomeService.getById(incomeId as number),
    enabled: typeof incomeId === "number" && incomeId > 0,
  });
}

export function useCreateCollegeIncomeByAdmission() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (input: { admission_no: string; payload: CollegeIncomeCreate }) =>
      CollegeIncomeService.createByAdmission(input.admission_no, input.payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.income.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.income.root(), type: 'active' });
    },
  }, "Income record created successfully");
}

export function useUpdateCollegeIncome(incomeId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeIncomeUpdate) => CollegeIncomeService.update(incomeId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.income.detail(incomeId) });
      void qc.invalidateQueries({ queryKey: collegeKeys.income.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.income.root(), type: 'active' });
    },
  }, "Income record updated successfully");
}

export function useCreateCollegeIncomeByReservation() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeIncomeCreateReservation) => CollegeIncomeService.createByReservation(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.income.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.income.root(), type: 'active' });
    },
  }, "Income record created successfully");
}

export function useCollegeIncomeDashboard(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...collegeKeys.income.root(), "dashboard"],
    queryFn: () => CollegeIncomeService.dashboard(),
    enabled: options?.enabled !== false, // ✅ OPTIMIZATION: Allow disabling for on-demand fetching
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true, // Refetch on mount if enabled and data is stale
  });
}

export function useCollegeIncomeRecent(limit?: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...collegeKeys.income.root(), "recent", limit ?? undefined],
    queryFn: () => CollegeIncomeService.recent(limit),
    enabled: options?.enabled !== false,
  });
}

export function useCollegeFinanceReport(params?: CollegeFinanceReportParams) {
  return useQuery({
    queryKey: [...collegeKeys.income.root(), "finance-report", params],
    queryFn: () => CollegeIncomeService.getFinanceReport(params),
    enabled: !!params && !!params.start_date && !!params.end_date,
  });
}

export function useCollegeIncomeSummary(params?: CollegeIncomeSummaryParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...collegeKeys.income.root(), "summary", params],
    queryFn: () => CollegeIncomeService.getIncomeSummary(params),
    enabled: options?.enabled !== false, // ✅ OPTIMIZATION: Allow disabling for on-demand fetching
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true, // Refetch on mount if enabled and data is stale
    select: (data: any) => {
      const items = Array.isArray(data) ? data : (data.data || data.items || []);
      const total = Array.isArray(data) ? data.length : (data.total_count || data.items?.length || items.length);
      return { data: items, total_count: total };
    },
  });
}
