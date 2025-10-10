import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeTransportBalancesService } from "@/lib/services/college/transport-fee-balances.service";
import type { CollegeTransportBalanceBulkCreate, CollegeTransportBalanceBulkCreateResult, CollegeTransportFeeBalanceFullRead, CollegeTransportFeeBalanceListRead, CollegeTransportPaginatedResponse, CollegeTransportTermPaymentUpdate } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";

export function useCollegeTransportBalancesList(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: collegeKeys.transport.list(params as Record<string, unknown> | undefined),
    queryFn: () => CollegeTransportBalancesService.list(params) as Promise<CollegeTransportPaginatedResponse>,
  });
}

export function useCollegeTransportBalance(balanceId: number | null | undefined) {
  return useQuery({
    queryKey: typeof balanceId === "number" ? collegeKeys.transport.detail(balanceId) : [...collegeKeys.transport.root(), "detail", "nil"],
    queryFn: () => CollegeTransportBalancesService.getById(balanceId as number) as Promise<CollegeTransportFeeBalanceFullRead>,
    enabled: typeof balanceId === "number" && balanceId > 0,
  });
}

export function useCreateCollegeTransportBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => CollegeTransportBalancesService.create(payload) as Promise<CollegeTransportFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.transport.root() });
    },
  });
}

export function useUpdateCollegeTransportBalance(balanceId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => CollegeTransportBalancesService.update(balanceId, payload) as Promise<CollegeTransportFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.transport.detail(balanceId) });
      qc.invalidateQueries({ queryKey: collegeKeys.transport.root() });
    },
  });
}

export function useDeleteCollegeTransportBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (balanceId: number) => CollegeTransportBalancesService.delete(balanceId),
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

export function useUpdateTransportTermPayment(balanceId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeTransportTermPaymentUpdate) =>
      CollegeTransportBalancesService.updateTermPayment(balanceId, payload) as Promise<CollegeTransportFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.transport.detail(balanceId) });
      qc.invalidateQueries({ queryKey: collegeKeys.transport.root() });
    },
  });
}


