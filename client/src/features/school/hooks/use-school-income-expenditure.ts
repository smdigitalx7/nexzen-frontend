import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolIncomeService } from "@/features/school/services/income.service";
import { SchoolExpenditureService } from "@/features/school/services/expenditure.service";
import type { SchoolExpenditureCreate, SchoolExpenditureRead, SchoolExpenditureUpdate, SchoolIncomeCreate, SchoolIncomeCreateReservation, SchoolIncomeRead, SchoolIncomeUpdate, SchoolExpenditureDashboardStats, SchoolRecentExpenditure, SchoolFinanceReport, SchoolFinanceReportParams } from "@/features/school/types";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";

export function useSchoolIncomeList(params?: { admission_no?: string; purpose?: string; start_date?: string; end_date?: string; page?: number; page_size?: number; search?: string | null }, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: schoolKeys.income.list(params as Record<string, unknown> | undefined),
    queryFn: () => SchoolIncomeService.list(params),
    enabled: options?.enabled !== false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
    // Return raw response so callers can use both data and total_count (no select)
  });
}

export function useSchoolIncome(incomeId: number | null | undefined) {
  return useQuery({
    queryKey: typeof incomeId === "number" ? schoolKeys.income.detail(incomeId) : [...schoolKeys.income.root(), "detail", "nil"],
    queryFn: () => SchoolIncomeService.getById(incomeId as number),
    enabled: typeof incomeId === "number" && incomeId > 0,
  });
}

export function useSchoolIncomeDashboard(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...schoolKeys.income.root(), "dashboard"],
    queryFn: () => SchoolIncomeService.getDashboard(),
    enabled: options?.enabled !== false, // ✅ OPTIMIZATION: Allow disabling for on-demand fetching
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true, // Refetch on mount if enabled and data is stale
    select: (data: any) => {
      // Handle potential { items: [stats] } wrapper or [stats] array
      if (data?.items && Array.isArray(data.items) && data.items.length > 0) return data.items[0];
      if (Array.isArray(data) && data.length > 0) return data[0];
      return data;
    },
  });
}

export function useSchoolIncomeRecent(limit?: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...schoolKeys.income.root(), "recent", limit ?? undefined],
    queryFn: () => SchoolIncomeService.getRecent(limit),
    enabled: options?.enabled !== false,
  });
}

export function useSchoolExpenditureDashboard(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...schoolKeys.expenditure.root(), "dashboard"],
    queryFn: () => SchoolExpenditureService.getDashboard(),
    enabled: options?.enabled !== false, // ✅ OPTIMIZATION: Allow disabling for on-demand fetching
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true, // Refetch on mount if enabled and data is stale
    select: (data: any) => {
        // Handle potential { items: [stats] } wrapper or [stats] array
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) return data.items[0];
        if (Array.isArray(data) && data.length > 0) return data[0];
        return data;
      },
  });
}

export function useSchoolExpenditureRecent(limit?: number) {
  return useQuery({
    queryKey: [...schoolKeys.expenditure.root(), "recent", limit ?? undefined],
    queryFn: () => SchoolExpenditureService.getRecent(limit),
  });
}

export function useCreateSchoolIncome() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolIncomeCreate) => SchoolIncomeService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.income.root() });
      void qc.invalidateQueries({ queryKey: schoolKeys.income.list({}) });
      void qc.refetchQueries({ queryKey: schoolKeys.income.root(), type: 'active' });
    },
  }, "Income record created successfully");
}

export function useCreateSchoolIncomeByAdmission() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (input: { admission_no: string; payload: SchoolIncomeCreate }) => SchoolIncomeService.createByAdmission(input.admission_no, input.payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.income.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.income.root(), type: 'active' });
    },
  }, "Income record created successfully");
}

export function useUpdateSchoolIncome(incomeId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolIncomeUpdate) => SchoolIncomeService.update(incomeId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.income.detail(incomeId) });
      void qc.invalidateQueries({ queryKey: schoolKeys.income.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.income.root(), type: 'active' });
    },
  }, "Income record updated successfully");
}

export function useCreateSchoolIncomeByReservation() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolIncomeCreateReservation) => SchoolIncomeService.createByReservation(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.income.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.income.root(), type: 'active' });
    },
  }, "Income record created successfully");
}

export function useSchoolExpenditureList(params?: { start_date?: string; end_date?: string; page?: number; page_size?: number; search?: string | null }, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: schoolKeys.expenditure.list(params as Record<string, unknown> | undefined),
    queryFn: () => SchoolExpenditureService.list(params),
    enabled: options?.enabled !== false, // ✅ OPTIMIZATION: Allow disabling for on-demand fetching
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true, // Refetch on mount if enabled and data is stale
    select: (data: any) => (Array.isArray(data) ? data : data.data || data.items || []), // Handle array, paginated .data, and .items
  });
}

export function useSchoolExpenditure(expenditureId: number | null | undefined) {
  return useQuery({
    queryKey: typeof expenditureId === "number" ? schoolKeys.expenditure.detail(expenditureId) : [...schoolKeys.expenditure.root(), "detail", "nil"],
    queryFn: () => SchoolExpenditureService.getById(expenditureId as number),
    enabled: typeof expenditureId === "number" && expenditureId > 0,
  });
}


export function useCreateSchoolExpenditure() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolExpenditureCreate) => SchoolExpenditureService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.expenditure.root() });
      void qc.invalidateQueries({ queryKey: schoolKeys.expenditure.list({}) });
      void qc.refetchQueries({ queryKey: schoolKeys.expenditure.root(), type: 'active' });
    },
  }, "Expenditure record created successfully");
}

export function useUpdateSchoolExpenditure(expenditureId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolExpenditureUpdate) => SchoolExpenditureService.update(expenditureId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.expenditure.detail(expenditureId) });
      void qc.invalidateQueries({ queryKey: schoolKeys.expenditure.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.expenditure.root(), type: 'active' });
    },
  }, "Expenditure record updated successfully");
}

export function useDeleteSchoolExpenditure() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (expenditureId: number) => SchoolExpenditureService.delete(expenditureId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.expenditure.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.expenditure.root(), type: 'active' });
    },
  }, "Expenditure record deleted successfully");
}

export function useUpdateSchoolExpenditureStatus(expenditureId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (status: "PENDING" | "APPROVED" | "REJECTED") => 
      SchoolExpenditureService.updateStatus(expenditureId, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.expenditure.detail(expenditureId) });
      void qc.invalidateQueries({ queryKey: schoolKeys.expenditure.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.expenditure.root(), type: 'active' });
    },
  }, "Expenditure status updated successfully");
}

export function useSchoolFinanceReport(params?: SchoolFinanceReportParams) {
  return useQuery({
    queryKey: [...schoolKeys.income.root(), "finance-report", params],
    queryFn: () => SchoolIncomeService.getFinanceReport(params),
    enabled: !!params && !!params.start_date && !!params.end_date,
  });
}


