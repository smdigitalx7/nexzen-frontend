import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeTransportBalancesService } from "@/lib/services/college/transport-fee-balances.service";
import type { CollegeTransportBalanceBulkCreate, CollegeTransportBalanceBulkCreateResult, CollegeTransportFeeBalanceFullRead, CollegeTransportFeeBalanceListRead, CollegeTransportFeeBalanceUpdate, CollegeTransportPaginatedResponse, CollegeTransportTermPaymentUpdate, CollegeTransportFeeBalanceDashboardStats } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useCollegeTransportBalancesList(params?: { page?: number; pageSize?: number; class_id?: number; group_id?: number }) {
  return useQuery({
    queryKey: collegeKeys.transport.list(params),
    queryFn: () => CollegeTransportBalancesService.list(params) as Promise<CollegeTransportPaginatedResponse>,
    enabled: !!(params?.class_id && params?.group_id), // Only run query when required params are provided
  });
}

export function useCollegeTransportBalance(enrollmentId: number | null | undefined) {
  return useQuery({
    queryKey: typeof enrollmentId === "number" ? collegeKeys.transport.detail(enrollmentId) : [...collegeKeys.transport.root(), "detail", "nil"],
    queryFn: () => CollegeTransportBalancesService.getById(enrollmentId as number) as Promise<CollegeTransportFeeBalanceFullRead>,
    enabled: typeof enrollmentId === "number" && enrollmentId > 0,
  });
}

export function useCreateCollegeTransportBalance() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeTransportFeeBalanceListRead) =>
      CollegeTransportBalancesService.create(payload as any) as Promise<CollegeTransportFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.transport.root() });
    },
  }, "Transport balance created successfully");
}

export function useUpdateCollegeTransportBalance(enrollmentId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeTransportFeeBalanceUpdate) => CollegeTransportBalancesService.update(enrollmentId, payload) as Promise<CollegeTransportFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.transport.detail(enrollmentId) });
      qc.invalidateQueries({ queryKey: collegeKeys.transport.root() });
    },
  }, "Transport balance updated successfully");
}

export function useDeleteCollegeTransportBalance() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (enrollmentId: number) => CollegeTransportBalancesService.delete(enrollmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.transport.root() });
    },
  }, "Transport balance deleted successfully");
}

export function useBulkCreateCollegeTransportBalances() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeTransportBalanceBulkCreate) =>
      CollegeTransportBalancesService.bulkCreate(payload) as Promise<CollegeTransportBalanceBulkCreateResult>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.transport.root() });
    },
  }, "Transport balances created successfully");
}

export function useUpdateTransportTermPayment(enrollmentId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeTransportTermPaymentUpdate) =>
      CollegeTransportBalancesService.updateTermPayment(enrollmentId, payload) as Promise<CollegeTransportFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.transport.detail(enrollmentId) });
      qc.invalidateQueries({ queryKey: collegeKeys.transport.root() });
    },
  }, "Transport payment updated successfully");
}

export function useCollegeTransportFeeBalancesDashboard() {
  return useQuery({
    queryKey: [...collegeKeys.transport.root(), "dashboard"],
    queryFn: () => CollegeTransportBalancesService.dashboard(),
  });
}
