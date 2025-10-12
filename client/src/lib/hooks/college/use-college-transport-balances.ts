import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeTransportBalancesService } from "@/lib/services/college/transport-fee-balances.service";
import type { CollegeTransportBalanceBulkCreate, CollegeTransportBalanceBulkCreateResult, CollegeTransportFeeBalanceFullRead, CollegeTransportFeeBalanceListRead, CollegeTransportFeeBalanceUpdate, CollegeTransportPaginatedResponse, CollegeTransportTermPaymentUpdate } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";

export function useCollegeTransportBalancesList(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: collegeKeys.transport.list(params),
    queryFn: () => CollegeTransportBalancesService.list(params) as Promise<CollegeTransportPaginatedResponse>,
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
  return useMutation({
    mutationFn: (payload: CollegeTransportFeeBalanceListRead) =>
      CollegeTransportBalancesService.create(payload as any) as Promise<CollegeTransportFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.transport.root() });
    },
  });
}

export function useUpdateCollegeTransportBalance(enrollmentId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeTransportFeeBalanceUpdate) => CollegeTransportBalancesService.update(enrollmentId, payload) as Promise<CollegeTransportFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.transport.detail(enrollmentId) });
      qc.invalidateQueries({ queryKey: collegeKeys.transport.root() });
    },
  });
}

export function useDeleteCollegeTransportBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: number) => CollegeTransportBalancesService.delete(enrollmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.transport.root() });
    },
  });
}

export function useBulkCreateCollegeTransportBalances() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeTransportBalanceBulkCreate) =>
      CollegeTransportBalancesService.bulkCreate(payload) as Promise<CollegeTransportBalanceBulkCreateResult>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.transport.root() });
    },
  });
}

export function useUpdateTransportTermPayment(enrollmentId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeTransportTermPaymentUpdate) =>
      CollegeTransportBalancesService.updateTermPayment(enrollmentId, payload) as Promise<CollegeTransportFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.transport.detail(enrollmentId) });
      qc.invalidateQueries({ queryKey: collegeKeys.transport.root() });
    },
  });
}
