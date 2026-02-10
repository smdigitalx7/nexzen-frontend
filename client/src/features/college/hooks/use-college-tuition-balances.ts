import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeTuitionBalancesService, type CollegeTuitionBalancesListParams } from "@/features/college/services/tuition-fee-balances.service";
import type { CollegeBookFeePaymentUpdate, CollegeTermPaymentUpdate, CollegeTuitionBalanceBulkCreate, CollegeTuitionBalanceBulkCreateResult, CollegeTuitionFeeBalanceFullRead, CollegeTuitionFeeBalanceRead, CollegeTuitionPaginatedResponse, CollegeTuitionUnpaidTermsResponse, CollegeTuitionFeeBalanceDashboardStats, ConcessionUpdateRequest } from "@/features/college/types/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";
import { batchInvalidateQueries } from "@/common/hooks/useGlobalRefetch";
import { COLLEGE_INVALIDATION_MAPS, resolveInvalidationKeys } from "@/common/hooks/invalidation-maps";

export function useCollegeTuitionBalancesList(params?: CollegeTuitionBalancesListParams) {
  return useQuery({
    queryKey: collegeKeys.tuition.list(params),
    queryFn: () => CollegeTuitionBalancesService.list(params!),
    enabled: 
      !!params && 
      typeof params.class_id === "number" && 
      params.class_id > 0 &&
      typeof params.group_id === "number" && 
      params.group_id > 0,
  });
}

export function useCollegeTuitionBalance(enrollmentId: number | null | undefined) {
  return useQuery({
    queryKey: typeof enrollmentId === "number" ? collegeKeys.tuition.detail(enrollmentId) : [...collegeKeys.tuition.root(), "detail", "nil"],
    queryFn: () => CollegeTuitionBalancesService.getById(enrollmentId as number),
    enabled: typeof enrollmentId === "number" && enrollmentId > 0,
  });
}

export function useCollegeTuitionBalanceByAdmission(admissionNo: string | null | undefined) {
  return useQuery({
    queryKey: admissionNo ? collegeKeys.tuition.byAdmission(admissionNo) : [...collegeKeys.tuition.root(), "by-admission", "nil"],
    queryFn: () => CollegeTuitionBalancesService.getByAdmissionNo(admissionNo as string),
    enabled: typeof admissionNo === "string" && admissionNo.length > 0,
  });
}

export function useCollegeTuitionUnpaidTerms(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: collegeKeys.tuition.unpaidTerms(params),
    queryFn: () => CollegeTuitionBalancesService.getUnpaidTerms(params),
  });
}

export function useCreateCollegeTuitionBalance() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeTuitionFeeBalanceRead) =>
      CollegeTuitionBalancesService.create(payload as any),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.tuition.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.tuition.root(), type: 'active' });
    },
  }, "Tuition balance created successfully");
}

export function useBulkCreateCollegeTuitionBalances() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeTuitionBalanceBulkCreate) =>
      CollegeTuitionBalancesService.bulkCreate(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.tuition.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.tuition.root(), type: 'active' });
    },
  }, "Tuition balances created successfully");
}

export function useUpdateTuitionTermPayment(enrollmentId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeTermPaymentUpdate) =>
      CollegeTuitionBalancesService.updateTermPayment(enrollmentId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.tuition.detail(enrollmentId) });
      void qc.invalidateQueries({ queryKey: collegeKeys.tuition.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.tuition.root(), type: 'active' });
    },
  }, "Tuition payment updated successfully");
}

export function useUpdateBookFeePayment(enrollmentId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeBookFeePaymentUpdate) =>
      CollegeTuitionBalancesService.updateBookPayment(enrollmentId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.tuition.detail(enrollmentId) });
      void qc.invalidateQueries({ queryKey: collegeKeys.tuition.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.tuition.root(), type: 'active' });
    },
  }, "Book fee payment updated successfully");
}

export function useUpdateCollegeTuitionConcession(enrollmentId: number) {
  return useMutationWithSuccessToast({
    mutationFn: async (payload: ConcessionUpdateRequest) => {
      const result = await CollegeTuitionBalancesService.updateConcession(enrollmentId, payload);
      if (result && (result as any).success === false) {
        throw new Error((result as any).message || "Tuition concession update failed");
      }
      return result;
    },
    onSuccess: () => {
      const keysToInvalidate = resolveInvalidationKeys(COLLEGE_INVALIDATION_MAPS.fee.update, enrollmentId);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, (result) =>
    result && typeof (result as any).message === "string"
      ? (result as any).message
      : "Tuition concession updated successfully"
  );
}

export function useCollegeTuitionFeeBalancesDashboard() {
  return useQuery({
    queryKey: [...collegeKeys.tuition.root(), "dashboard"],
    queryFn: () => CollegeTuitionBalancesService.dashboard(),
  });
}
