import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeTuitionBalancesService } from "@/lib/services/college/tuition-fee-balances.service";
import type { CollegeBookFeePaymentUpdate, CollegeTermPaymentUpdate, CollegeTuitionBalanceBulkCreate, CollegeTuitionBalanceBulkCreateResult, CollegeTuitionFeeBalanceFullRead, CollegeTuitionFeeBalanceRead, CollegeTuitionPaginatedResponse, CollegeTuitionUnpaidTermsResponse } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";

export function useCollegeTuitionBalancesList(params?: { page?: number; pageSize?: number; class_id?: number; group_id?: number; course_id?: number; admission_no?: string }) {
  return useQuery({
    queryKey: collegeKeys.tuition.list(params),
    queryFn: () => CollegeTuitionBalancesService.list(params) as Promise<CollegeTuitionPaginatedResponse>,
  });
}

export function useCollegeTuitionBalance(enrollmentId: number | null | undefined) {
  return useQuery({
    queryKey: typeof enrollmentId === "number" ? collegeKeys.tuition.detail(enrollmentId) : [...collegeKeys.tuition.root(), "detail", "nil"],
    queryFn: () => CollegeTuitionBalancesService.getById(enrollmentId as number) as Promise<CollegeTuitionFeeBalanceFullRead>,
    enabled: typeof enrollmentId === "number" && enrollmentId > 0,
  });
}

export function useCollegeTuitionBalanceByAdmission(admissionNo: string | null | undefined) {
  return useQuery({
    queryKey: admissionNo ? collegeKeys.tuition.byAdmission(admissionNo) : [...collegeKeys.tuition.root(), "by-admission", "nil"],
    queryFn: () => CollegeTuitionBalancesService.getByAdmissionNo(admissionNo as string) as Promise<CollegeTuitionFeeBalanceRead[]>,
    enabled: typeof admissionNo === "string" && admissionNo.length > 0,
  });
}

export function useCollegeTuitionUnpaidTerms(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: collegeKeys.tuition.unpaidTerms(params),
    queryFn: () => CollegeTuitionBalancesService.getUnpaidTerms(params) as Promise<CollegeTuitionUnpaidTermsResponse>,
  });
}

export function useCreateCollegeTuitionBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeTuitionFeeBalanceRead) =>
      CollegeTuitionBalancesService.create(payload as any) as Promise<CollegeTuitionFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.tuition.root() });
    },
  });
}

export function useUpdateCollegeTuitionBalance(enrollmentId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CollegeTuitionFeeBalanceRead>) =>
      CollegeTuitionBalancesService.update(enrollmentId, payload as any) as Promise<CollegeTuitionFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.tuition.detail(enrollmentId) });
      qc.invalidateQueries({ queryKey: collegeKeys.tuition.root() });
    },
  });
}

export function useDeleteCollegeTuitionBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: number) => CollegeTuitionBalancesService.delete(enrollmentId),
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

export function useUpdateTuitionTermPayment(enrollmentId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeTermPaymentUpdate) =>
      CollegeTuitionBalancesService.updateTermPayment(enrollmentId, payload) as Promise<CollegeTuitionFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.tuition.detail(enrollmentId) });
      qc.invalidateQueries({ queryKey: collegeKeys.tuition.root() });
    },
  });
}

export function useUpdateBookFeePayment(enrollmentId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeBookFeePaymentUpdate) =>
      CollegeTuitionBalancesService.updateBookPayment(enrollmentId, payload) as Promise<CollegeTuitionFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.tuition.detail(enrollmentId) });
      qc.invalidateQueries({ queryKey: collegeKeys.tuition.root() });
    },
  });
}
