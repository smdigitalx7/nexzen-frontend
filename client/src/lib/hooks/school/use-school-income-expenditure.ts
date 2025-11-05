import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolIncomeService } from "@/lib/services/school/income.service";
import { SchoolExpenditureService } from "@/lib/services/school/expenditure.service";
import type { SchoolExpenditureCreate, SchoolExpenditureRead, SchoolExpenditureUpdate, SchoolIncomeCreate, SchoolIncomeCreateReservation, SchoolIncomeRead, SchoolIncomeUpdate, SchoolExpenditureDashboardStats, SchoolRecentExpenditure, SchoolFinanceReport, SchoolFinanceReportParams } from "@/lib/types/school";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useSchoolIncomeList(params?: { admission_no?: string; purpose?: string; start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: schoolKeys.income.list(params as Record<string, unknown> | undefined),
    queryFn: () => SchoolIncomeService.list(params),
  });
}

export function useSchoolIncome(incomeId: number | null | undefined) {
  return useQuery({
    queryKey: typeof incomeId === "number" ? schoolKeys.income.detail(incomeId) : [...schoolKeys.income.root(), "detail", "nil"],
    queryFn: () => SchoolIncomeService.getById(incomeId as number),
    enabled: typeof incomeId === "number" && incomeId > 0,
  });
}

export function useSchoolIncomeDashboard() {
  return useQuery({
    queryKey: [...schoolKeys.income.root(), "dashboard"],
    queryFn: () => SchoolIncomeService.getDashboard(),
  });
}

export function useSchoolIncomeRecent(limit?: number) {
  return useQuery({
    queryKey: [...schoolKeys.income.root(), "recent", { limit }],
    queryFn: () => SchoolIncomeService.getRecent(limit),
  });
}

export function useSchoolExpenditureDashboard() {
  return useQuery({
    queryKey: [...schoolKeys.expenditure.root(), "dashboard"],
    queryFn: () => SchoolExpenditureService.getDashboard(),
  });
}

export function useSchoolExpenditureRecent(limit?: number) {
  return useQuery({
    queryKey: [...schoolKeys.expenditure.root(), "recent", { limit }],
    queryFn: () => SchoolExpenditureService.getRecent(limit),
  });
}

export function useCreateSchoolIncome() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolIncomeCreate) => SchoolIncomeService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.income.root() });
      qc.invalidateQueries({ queryKey: schoolKeys.income.list({}) });
    },
  }, "Income record created successfully");
}

export function useCreateSchoolIncomeByAdmission() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (input: { admission_no: string; payload: SchoolIncomeCreate }) => SchoolIncomeService.createByAdmission(input.admission_no, input.payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.income.root() });
    },
  }, "Income record created successfully");
}

export function useUpdateSchoolIncome(incomeId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolIncomeUpdate) => SchoolIncomeService.update(incomeId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.income.detail(incomeId) });
      qc.invalidateQueries({ queryKey: schoolKeys.income.root() });
    },
  }, "Income record updated successfully");
}

export function useCreateSchoolIncomeByReservation() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolIncomeCreateReservation) => SchoolIncomeService.createByReservation(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.income.root() });
    },
  }, "Income record created successfully");
}

export function useSchoolExpenditureList(params?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: schoolKeys.expenditure.list(params as Record<string, unknown> | undefined),
    queryFn: () => SchoolExpenditureService.list(params),
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
      qc.invalidateQueries({ queryKey: schoolKeys.expenditure.root() });
      qc.invalidateQueries({ queryKey: schoolKeys.expenditure.list({}) });
    },
  }, "Expenditure record created successfully");
}

export function useUpdateSchoolExpenditure(expenditureId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolExpenditureUpdate) => SchoolExpenditureService.update(expenditureId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.expenditure.detail(expenditureId) });
      qc.invalidateQueries({ queryKey: schoolKeys.expenditure.root() });
    },
  }, "Expenditure record updated successfully");
}

export function useDeleteSchoolExpenditure() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (expenditureId: number) => SchoolExpenditureService.delete(expenditureId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.expenditure.root() });
    },
  }, "Expenditure record deleted successfully");
}

export function useSchoolFinanceReport(params?: SchoolFinanceReportParams) {
  return useQuery({
    queryKey: [...schoolKeys.income.root(), "finance-report", params],
    queryFn: () => SchoolIncomeService.getFinanceReport(params),
    enabled: !!params && !!params.start_date && !!params.end_date,
  });
}


