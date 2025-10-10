import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeTuitionBalancesService } from "@/lib/services/college/tuition-fee-balances.service";
import type { CollegeBookFeePaymentUpdate, CollegeTermPaymentUpdate, CollegeTuitionBalanceBulkCreate, CollegeTuitionBalanceBulkCreateResult, CollegeTuitionFeeBalanceFullRead, CollegeTuitionFeeBalanceRead, CollegeTuitionPaginatedResponse, CollegeTuitionUnpaidTermsResponse } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";

export function useCollegeTuitionBalancesList(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: collegeKeys.tuition.list(params as Record<string, unknown> | undefined),
    queryFn: () => CollegeTuitionBalancesService.list(params) as Promise<CollegeTuitionPaginatedResponse>,
  });
}

export function useCollegeTuitionBalance(balanceId: number | null | undefined) {
  return useQuery({
    queryKey: typeof balanceId === "number" ? collegeKeys.tuition.detail(balanceId) : [...collegeKeys.tuition.root(), "detail", "nil"],
    queryFn: () => CollegeTuitionBalancesService.getById(balanceId as number) as Promise<CollegeTuitionFeeBalanceFullRead>,
    enabled: typeof balanceId === "number" && balanceId > 0,
  });
}

export function useCollegeTuitionBalanceByAdmission(admissionNo: string | null | undefined) {
  return useQuery({
    queryKey: admissionNo ? collegeKeys.tuition.byAdmission(admissionNo) : [...collegeKeys.tuition.root(), "by-admission", "nil"],
    queryFn: () => CollegeTuitionBalancesService.getByAdmissionNo(admissionNo as string) as Promise<CollegeTuitionFeeBalanceFullRead>,
    enabled: typeof admissionNo === "string" && admissionNo.length > 0,
  });
}

export function useCollegeTuitionUnpaidTerms(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: collegeKeys.tuition.unpaidTerms(params as Record<string, unknown> | undefined),
    queryFn: () => CollegeTuitionBalancesService.getUnpaidTerms(params) as Promise<CollegeTuitionUnpaidTermsResponse>,
  });
}

export function useCreateCollegeTuitionBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => CollegeTuitionBalancesService.create(payload) as Promise<CollegeTuitionFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.tuition.root() });
    },
  });
}

export function useUpdateCollegeTuitionBalance(balanceId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => CollegeTuitionBalancesService.update(balanceId, payload) as Promise<CollegeTuitionFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.tuition.detail(balanceId) });
      qc.invalidateQueries({ queryKey: collegeKeys.tuition.root() });
    },
  });
}

export function useDeleteCollegeTuitionBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (balanceId: number) => CollegeTuitionBalancesService.delete(balanceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.tuition.root() });
    },
  });
}

export function useBulkCreateCollegeTuitionBalances() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeTuitionBalanceBulkCreate) =>
      CollegeTuitionBalancesService.bulkCreate(payload) as Promise<CollegeTuitionBalanceBulkCreateResult>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.tuition.root() });
    },
  });
}

export function useUpdateTuitionTermPayment(balanceId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeTermPaymentUpdate) =>
      CollegeTuitionBalancesService.updateTermPayment(balanceId, payload) as Promise<CollegeTuitionFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.tuition.detail(balanceId) });
      qc.invalidateQueries({ queryKey: collegeKeys.tuition.root() });
    },
  });
}

export function useUpdateBookFeePayment(balanceId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeBookFeePaymentUpdate) =>
      CollegeTuitionBalancesService.updateBookPayment(balanceId, payload) as Promise<CollegeTuitionFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.tuition.detail(balanceId) });
      qc.invalidateQueries({ queryKey: collegeKeys.tuition.root() });
    },
  });
}


