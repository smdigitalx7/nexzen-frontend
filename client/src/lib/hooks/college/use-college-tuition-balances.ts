import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeTuitionBalancesService } from "@/lib/services/college/tuition-fee-balances.service";
import type { CollegeBookFeePaymentUpdate, CollegeTermPaymentUpdate, CollegeTuitionBalanceBulkCreate, CollegeTuitionBalanceBulkCreateResult, CollegeTuitionFeeBalanceFullRead, CollegeTuitionFeeBalanceRead, CollegeTuitionPaginatedResponse, CollegeTuitionUnpaidTermsResponse, CollegeTuitionFeeBalanceDashboardStats } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useCollegeTuitionBalancesList(params?: { page?: number; pageSize?: number; class_id?: number; group_id?: number; course_id?: number; admission_no?: string }) {
  return useQuery({
    queryKey: collegeKeys.tuition.list(params),
    queryFn: () => CollegeTuitionBalancesService.list(params) as Promise<CollegeTuitionPaginatedResponse>,
    enabled: !!(params?.class_id && params?.group_id), // Only run query when required params are provided
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
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeTuitionFeeBalanceRead) =>
      CollegeTuitionBalancesService.create(payload as any) as Promise<CollegeTuitionFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.tuition.root() });
    },
  }, "Tuition balance created successfully");
}

export function useUpdateCollegeTuitionBalance(enrollmentId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: Partial<CollegeTuitionFeeBalanceRead>) =>
      CollegeTuitionBalancesService.update(enrollmentId, payload as any) as Promise<CollegeTuitionFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.tuition.detail(enrollmentId) });
      qc.invalidateQueries({ queryKey: collegeKeys.tuition.root() });
    },
  }, "Tuition balance updated successfully");
}

export function useDeleteCollegeTuitionBalance() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (enrollmentId: number) => CollegeTuitionBalancesService.delete(enrollmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.tuition.root() });
    },
  }, "Tuition balance deleted successfully");
}

export function useBulkCreateCollegeTuitionBalances() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeTuitionBalanceBulkCreate) =>
      CollegeTuitionBalancesService.bulkCreate(payload) as Promise<CollegeTuitionBalanceBulkCreateResult>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.tuition.root() });
    },
  }, "Tuition balances created successfully");
}

export function useUpdateTuitionTermPayment(enrollmentId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeTermPaymentUpdate) =>
      CollegeTuitionBalancesService.updateTermPayment(enrollmentId, payload) as Promise<CollegeTuitionFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.tuition.detail(enrollmentId) });
      qc.invalidateQueries({ queryKey: collegeKeys.tuition.root() });
    },
  }, "Tuition payment updated successfully");
}

export function useUpdateBookFeePayment(enrollmentId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeBookFeePaymentUpdate) =>
      CollegeTuitionBalancesService.updateBookPayment(enrollmentId, payload) as Promise<CollegeTuitionFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.tuition.detail(enrollmentId) });
      qc.invalidateQueries({ queryKey: collegeKeys.tuition.root() });
    },
  }, "Book fee payment updated successfully");
}

export function useCollegeTuitionFeeBalancesDashboard() {
  return useQuery({
    queryKey: [...collegeKeys.tuition.root(), "dashboard"],
    queryFn: () => CollegeTuitionBalancesService.dashboard(),
  });
}
