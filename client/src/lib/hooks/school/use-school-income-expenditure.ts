import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolIncomeService } from "@/lib/services/school/income.service";
import { SchoolExpenditureService } from "@/lib/services/school/expenditure.service";
import type { SchoolExpenditureCreate, SchoolExpenditureRead, SchoolExpenditureUpdate, SchoolIncomeCreate, SchoolIncomeCreateReservation, SchoolIncomeRead, SchoolIncomeUpdate, SchoolExpenditureDashboardStats, SchoolRecentExpenditure } from "@/lib/types/school";
import { schoolKeys } from "./query-keys";

export function useSchoolIncomeList(params?: { admission_no?: string; purpose?: string; start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: schoolKeys.income.list(params as Record<string, unknown> | undefined),
    queryFn: () => SchoolIncomeService.list(params) as Promise<SchoolIncomeRead[]>,
  });
}

export function useSchoolIncome(incomeId: number | null | undefined) {
  return useQuery({
    queryKey: typeof incomeId === "number" ? schoolKeys.income.detail(incomeId) : [...schoolKeys.income.root(), "detail", "nil"],
    queryFn: () => SchoolIncomeService.getById(incomeId as number) as Promise<SchoolIncomeRead>,
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
    queryFn: () => SchoolExpenditureService.getRecent(limit) as Promise<SchoolRecentExpenditure[]>,
  });
}

export function useCreateSchoolIncome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SchoolIncomeCreate) => SchoolIncomeService.create(payload) as Promise<SchoolIncomeRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.income.root() });
      qc.invalidateQueries({ queryKey: schoolKeys.income.list({}) });
    },
  });
}

export function useCreateSchoolIncomeByAdmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { admission_no: string; payload: SchoolIncomeCreate }) => SchoolIncomeService.createByAdmission(input.admission_no, input.payload) as Promise<SchoolIncomeRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.income.root() });
    },
  });
}

export function useUpdateSchoolIncome(incomeId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SchoolIncomeUpdate) => SchoolIncomeService.update(incomeId, payload) as Promise<SchoolIncomeRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.income.detail(incomeId) });
      qc.invalidateQueries({ queryKey: schoolKeys.income.root() });
    },
  });
}

export function useCreateSchoolIncomeByReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SchoolIncomeCreateReservation) => SchoolIncomeService.createByReservation(payload) as Promise<SchoolIncomeRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.income.root() });
    },
  });
}

export function useSchoolExpenditureList(params?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: schoolKeys.expenditure.list(params as Record<string, unknown> | undefined),
    queryFn: () => SchoolExpenditureService.list(params) as Promise<SchoolExpenditureRead[]>,
  });
}

export function useSchoolExpenditure(expenditureId: number | null | undefined) {
  return useQuery({
    queryKey: typeof expenditureId === "number" ? schoolKeys.expenditure.detail(expenditureId) : [...schoolKeys.expenditure.root(), "detail", "nil"],
    queryFn: () => SchoolExpenditureService.getById(expenditureId as number) as Promise<SchoolExpenditureRead>,
    enabled: typeof expenditureId === "number" && expenditureId > 0,
  });
}


export function useCreateSchoolExpenditure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SchoolExpenditureCreate) => SchoolExpenditureService.create(payload) as Promise<SchoolExpenditureRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.expenditure.root() });
      qc.invalidateQueries({ queryKey: schoolKeys.expenditure.list({}) });
    },
  });
}

export function useUpdateSchoolExpenditure(expenditureId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SchoolExpenditureUpdate) => SchoolExpenditureService.update(expenditureId, payload) as Promise<SchoolExpenditureRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.expenditure.detail(expenditureId) });
      qc.invalidateQueries({ queryKey: schoolKeys.expenditure.root() });
    },
  });
}

export function useDeleteSchoolExpenditure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (expenditureId: number) => SchoolExpenditureService.delete(expenditureId) as Promise<void>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.expenditure.root() });
    },
  });
}


