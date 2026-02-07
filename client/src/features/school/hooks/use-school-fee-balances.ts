import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolTuitionFeeBalancesService } from "@/features/school/services/tuition-fee-balances.service";
import { SchoolTransportFeeBalancesService } from "@/features/school/services/transport-fee-balances.service";
import type { SchoolBookFeePaymentUpdate, SchoolTermPaymentUpdate, SchoolTransportBalanceBulkCreate, SchoolTransportBalanceBulkCreateResult, SchoolTransportFeeBalanceFullRead, SchoolTransportFeeBalanceListRead, SchoolTransportPaginatedResponse, SchoolTransportTermPaymentUpdate, SchoolTuitionBalanceBulkCreate, SchoolTuitionBalanceBulkCreateResult, SchoolTuitionFeeBalanceFullRead, SchoolTuitionFeeBalanceRead, SchoolTuitionPaginatedResponse, SchoolTuitionFeeBalanceCreate, SchoolTuitionFeeBalanceUpdate, SchoolTransportFeeBalanceCreate, SchoolTransportFeeBalanceUpdate, ConcessionUpdateRequest } from "@/features/school/types";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";
import { batchInvalidateQueries } from "@/common/hooks/useGlobalRefetch";
import { SCHOOL_INVALIDATION_MAPS, resolveInvalidationKeys } from "@/common/hooks/invalidation-maps";

// Tuition
export function useSchoolTuitionBalancesList(params?: { page?: number; page_size?: number; class_id?: number; section_id?: number }) {
  return useQuery({
    queryKey: schoolKeys.tuition.list(params as Record<string, unknown> | undefined),
    queryFn: () =>
      SchoolTuitionFeeBalancesService.list(
        params as { class_id: number; page?: number; page_size?: number; section_id?: number }
      ),
    enabled: !!params?.class_id && params.class_id > 0,
  });
}

export function useSchoolTuitionBalance(enrollmentId: number | null | undefined) {
  return useQuery({
    queryKey: typeof enrollmentId === "number" ? schoolKeys.tuition.detail(enrollmentId) : [...schoolKeys.tuition.root(), "detail", "nil"],
    queryFn: () => SchoolTuitionFeeBalancesService.getById(enrollmentId as number),
    enabled: typeof enrollmentId === "number" && enrollmentId > 0,
  });
}

export function useSchoolTuitionBalancesDashboard(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...schoolKeys.tuition.root(), "dashboard"],
    queryFn: () => SchoolTuitionFeeBalancesService.getDashboard(),
    enabled: options?.enabled !== false, // ✅ OPTIMIZATION: Allow gating by tab/route
    staleTime: 30 * 1000, // 30 seconds - dashboard stats change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: true, // Only refetch on mount if data is stale
  });
}

export function useSchoolTuitionUnpaidTermsReport() {
  return useQuery({
    queryKey: [...schoolKeys.tuition.root(), "unpaid-terms"],
    queryFn: () => SchoolTuitionFeeBalancesService.getUnpaidTermsReport(),
  });
}

export function useSchoolTransportBalancesDashboard(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...schoolKeys.transport.root(), "dashboard"],
    queryFn: () => SchoolTransportFeeBalancesService.getDashboard(),
    enabled: options?.enabled !== false, // ✅ OPTIMIZATION: Allow gating by tab/route
    staleTime: 30 * 1000, // 30 seconds - dashboard stats change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: true, // Only refetch on mount if data is stale
  });
}

export function useSchoolTuitionBalanceByAdmission(admissionNo: string | null | undefined) {
  return useQuery({
    queryKey: admissionNo ? [...schoolKeys.tuition.root(), "by-admission", admissionNo] : [...schoolKeys.tuition.root(), "by-admission", "nil"],
    queryFn: () => SchoolTuitionFeeBalancesService.getByAdmission(admissionNo as string),
    enabled: typeof admissionNo === "string" && admissionNo.length > 0,
  });
}

export function useSchoolTransportBalanceByAdmission(admissionNo: string | null | undefined) {
  return useQuery({
    queryKey: admissionNo ? [...schoolKeys.transport.root(), "by-admission", admissionNo] : [...schoolKeys.transport.root(), "by-admission", "nil"],
    queryFn: () => SchoolTransportFeeBalancesService.getByAdmission(admissionNo as string),
    enabled: typeof admissionNo === "string" && admissionNo.length > 0,
  });
}

export function useCreateSchoolTuitionBalance() {
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolTuitionFeeBalanceCreate) => SchoolTuitionFeeBalancesService.create(payload),
    // ✅ FIX: Use invalidation map to ensure all related queries are invalidated
    onSuccess: () => {
      const keysToInvalidate = resolveInvalidationKeys(SCHOOL_INVALIDATION_MAPS.fee.payment);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Tuition balance created successfully");
}

export function useUpdateSchoolTuitionBalance(enrollmentId: number) {
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolTuitionFeeBalanceUpdate) => SchoolTuitionFeeBalancesService.update(enrollmentId, payload),
    // ✅ FIX: Use invalidation map to ensure all related queries are invalidated
    onSuccess: () => {
      const keysToInvalidate = resolveInvalidationKeys(SCHOOL_INVALIDATION_MAPS.fee.update, enrollmentId);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Tuition balance updated successfully");
}

export function useDeleteSchoolTuitionBalance() {
  return useMutationWithSuccessToast({
    mutationFn: (enrollmentId: number) => SchoolTuitionFeeBalancesService.delete(enrollmentId),
    // ✅ FIX: Use invalidation map to ensure all related queries are invalidated
    onSuccess: (_data, enrollmentId) => {
      const keysToInvalidate = resolveInvalidationKeys(SCHOOL_INVALIDATION_MAPS.fee.update, enrollmentId);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Tuition balance deleted successfully");
}

export function useBulkCreateSchoolTuitionBalances() {
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolTuitionBalanceBulkCreate) => SchoolTuitionFeeBalancesService.bulkCreate(payload),
    // ✅ FIX: Use invalidation map to ensure all related queries are invalidated
    onSuccess: () => {
      const keysToInvalidate = resolveInvalidationKeys(SCHOOL_INVALIDATION_MAPS.fee.payment);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Tuition balances created successfully");
}

export function useUpdateSchoolTuitionTermPayment(enrollmentId: number) {
  const queryClient = useQueryClient();
  
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolTermPaymentUpdate) => SchoolTuitionFeeBalancesService.updateTermPayment(enrollmentId, payload),
    // ✅ PHASE 3: Optimistic update for immediate UI feedback
    // Note: Fee calculations are complex, so we invalidate on success to ensure accuracy
    // ✅ FIX: Use invalidation map to ensure all related queries are invalidated
    onSuccess: () => {
      const keysToInvalidate = resolveInvalidationKeys(SCHOOL_INVALIDATION_MAPS.fee.update, enrollmentId);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Tuition payment updated successfully");
}

export function useUpdateSchoolBookFeePayment(enrollmentId: number) {
  const queryClient = useQueryClient();
  
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolBookFeePaymentUpdate) => SchoolTuitionFeeBalancesService.updateBookPayment(enrollmentId, payload),
    // ✅ PHASE 3: Optimistic update for immediate UI feedback
    // Note: Fee calculations are complex, so we invalidate on success to ensure accuracy
    // ✅ FIX: Use invalidation map to ensure all related queries are invalidated
    onSuccess: () => {
      const keysToInvalidate = resolveInvalidationKeys(SCHOOL_INVALIDATION_MAPS.fee.update, enrollmentId);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Book fee payment updated successfully");
}

export function useUpdateSchoolTuitionConcession(enrollmentId: number) {
  return useMutationWithSuccessToast({
    mutationFn: async (payload: ConcessionUpdateRequest) => {
      const result = await SchoolTuitionFeeBalancesService.updateConcession(enrollmentId, payload);
      if (result && result.success === false) {
        throw new Error(result.message || "Tuition concession update failed");
      }
      return result;
    },
    onSuccess: () => {
      const keysToInvalidate = resolveInvalidationKeys(SCHOOL_INVALIDATION_MAPS.fee.update, enrollmentId);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Tuition concession updated successfully");
}

// Transport
export function useSchoolTransportBalancesList(params?: { page?: number; page_size?: number; class_id?: number; section_id?: number }) {
  return useQuery({
    queryKey: schoolKeys.transport.list(params as Record<string, unknown> | undefined),
    queryFn: () =>
      SchoolTransportFeeBalancesService.list(
        params as { class_id: number; page?: number; page_size?: number; section_id?: number }
      ),
    enabled: !!params?.class_id && params.class_id > 0,
  });
}

export function useSchoolTransportBalance(enrollmentId: number | null | undefined) {
  return useQuery({
    queryKey: typeof enrollmentId === "number" ? schoolKeys.transport.detail(enrollmentId) : [...schoolKeys.transport.root(), "detail", "nil"],
    queryFn: () => SchoolTransportFeeBalancesService.getById(enrollmentId as number),
    enabled: typeof enrollmentId === "number" && enrollmentId > 0,
  });
}

export function useCreateSchoolTransportBalance() {
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolTransportFeeBalanceCreate) => SchoolTransportFeeBalancesService.create(payload),
    // ✅ FIX: Use invalidation map to ensure all related queries are invalidated
    onSuccess: () => {
      const keysToInvalidate = resolveInvalidationKeys(SCHOOL_INVALIDATION_MAPS.fee.payment);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Transport balance created successfully");
}

export function useUpdateSchoolTransportBalance(enrollmentId: number) {
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolTransportFeeBalanceUpdate) => SchoolTransportFeeBalancesService.update(enrollmentId, payload),
    // ✅ FIX: Use invalidation map to ensure all related queries are invalidated
    onSuccess: () => {
      const keysToInvalidate = resolveInvalidationKeys(SCHOOL_INVALIDATION_MAPS.fee.update, enrollmentId);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Transport balance updated successfully");
}

export function useDeleteSchoolTransportBalance() {
  return useMutationWithSuccessToast({
    mutationFn: (enrollmentId: number) => SchoolTransportFeeBalancesService.delete(enrollmentId),
    // ✅ FIX: Use invalidation map to ensure all related queries are invalidated
    onSuccess: (_data, enrollmentId) => {
      const keysToInvalidate = resolveInvalidationKeys(SCHOOL_INVALIDATION_MAPS.fee.update, enrollmentId);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Transport balance deleted successfully");
}

export function useBulkCreateSchoolTransportBalances() {
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolTransportBalanceBulkCreate) => SchoolTransportFeeBalancesService.bulkCreate(payload),
    // ✅ FIX: Use invalidation map to ensure all related queries are invalidated
    onSuccess: () => {
      const keysToInvalidate = resolveInvalidationKeys(SCHOOL_INVALIDATION_MAPS.fee.payment);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Transport balances created successfully");
}

export function useUpdateSchoolTransportTermPayment(enrollmentId: number) {
  const queryClient = useQueryClient();
  
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolTransportTermPaymentUpdate) => SchoolTransportFeeBalancesService.updateTermPayment(enrollmentId, payload),
    // ✅ PHASE 3: Optimistic update for immediate UI feedback
    // Note: Fee calculations are complex, so we invalidate on success to ensure accuracy
    // ✅ FIX: Use invalidation map to ensure all related queries are invalidated
    onSuccess: () => {
      const keysToInvalidate = resolveInvalidationKeys(SCHOOL_INVALIDATION_MAPS.fee.update, enrollmentId);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Transport payment updated successfully");
}

export function useUpdateSchoolTransportConcession(enrollmentId: number) {
  return useMutationWithSuccessToast({
    mutationFn: async (payload: ConcessionUpdateRequest) => {
      const result = await SchoolTransportFeeBalancesService.updateConcession(enrollmentId, payload);
      if (result && result.success === false) {
        throw new Error(result.message || "Transport concession update failed");
      }
      return result;
    },
    onSuccess: () => {
      const keysToInvalidate = resolveInvalidationKeys(SCHOOL_INVALIDATION_MAPS.fee.update, enrollmentId);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Transport concession updated successfully");
}


