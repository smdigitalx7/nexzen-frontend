import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolTuitionFeeBalancesService } from "@/lib/services/school/tuition-fee-balances.service";
import { SchoolTransportFeeBalancesService } from "@/lib/services/school/transport-fee-balances.service";
import type { SchoolBookFeePaymentUpdate, SchoolTermPaymentUpdate, SchoolTransportBalanceBulkCreate, SchoolTransportBalanceBulkCreateResult, SchoolTransportFeeBalanceFullRead, SchoolTransportFeeBalanceListRead, SchoolTransportPaginatedResponse, SchoolTransportTermPaymentUpdate, SchoolTuitionBalanceBulkCreate, SchoolTuitionBalanceBulkCreateResult, SchoolTuitionFeeBalanceFullRead, SchoolTuitionFeeBalanceRead, SchoolTuitionPaginatedResponse } from "@/lib/types/school";
import { schoolKeys } from "./query-keys";

// Tuition
export function useSchoolTuitionBalancesList(params?: { page?: number; page_size?: number; class_id?: number; section_id?: number }) {
  return useQuery({
    queryKey: schoolKeys.tuition.list(params as Record<string, unknown> | undefined),
    queryFn: () => SchoolTuitionFeeBalancesService.list(params) as Promise<SchoolTuitionPaginatedResponse>,
    enabled: !!params?.class_id,
  });
}

export function useSchoolTuitionBalance(balanceId: number | null | undefined) {
  return useQuery({
    queryKey: typeof balanceId === "number" ? schoolKeys.tuition.detail(balanceId) : [...schoolKeys.tuition.root(), "detail", "nil"],
    queryFn: () => SchoolTuitionFeeBalancesService.getById(balanceId as number) as Promise<SchoolTuitionFeeBalanceFullRead>,
    enabled: typeof balanceId === "number" && balanceId > 0,
  });
}

export function useSchoolTuitionBalancesDashboard() {
  return useQuery({
    queryKey: [...schoolKeys.tuition.root(), "dashboard"],
    queryFn: () => SchoolTuitionFeeBalancesService.getDashboard(),
  });
}

export function useSchoolTuitionUnpaidTermsReport() {
  return useQuery({
    queryKey: [...schoolKeys.tuition.root(), "unpaid-terms"],
    queryFn: () => SchoolTuitionFeeBalancesService.getUnpaidTermsReport(),
  });
}

export function useSchoolTransportBalancesDashboard() {
  return useQuery({
    queryKey: [...schoolKeys.transport.root(), "dashboard"],
    queryFn: () => SchoolTransportFeeBalancesService.getDashboard(),
  });
}

export function useSchoolTuitionBalanceByAdmission(admissionNo: string | null | undefined) {
  return useQuery({
    queryKey: admissionNo ? [...schoolKeys.tuition.root(), "by-admission", admissionNo] : [...schoolKeys.tuition.root(), "by-admission", "nil"],
    queryFn: () => SchoolTuitionFeeBalancesService.getByAdmission(admissionNo as string) as Promise<SchoolTuitionFeeBalanceFullRead[]>,
    enabled: typeof admissionNo === "string" && admissionNo.length > 0,
  });
}

export function useSchoolTransportBalanceByAdmission(admissionNo: string | null | undefined) {
  return useQuery({
    queryKey: admissionNo ? [...schoolKeys.transport.root(), "by-admission", admissionNo] : [...schoolKeys.transport.root(), "by-admission", "nil"],
    queryFn: () => SchoolTransportFeeBalancesService.getByAdmission(admissionNo as string) as Promise<SchoolTransportFeeBalanceFullRead[]>,
    enabled: typeof admissionNo === "string" && admissionNo.length > 0,
  });
}

export function useCreateSchoolTuitionBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => SchoolTuitionFeeBalancesService.create(payload) as Promise<SchoolTuitionFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.tuition.root() });
    },
  });
}

export function useUpdateSchoolTuitionBalance(balanceId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => SchoolTuitionFeeBalancesService.update(balanceId, payload) as Promise<SchoolTuitionFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.tuition.detail(balanceId) });
      qc.invalidateQueries({ queryKey: schoolKeys.tuition.root() });
    },
  });
}

export function useDeleteSchoolTuitionBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (balanceId: number) => SchoolTuitionFeeBalancesService.delete(balanceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.tuition.root() });
    },
  });
}

export function useBulkCreateSchoolTuitionBalances() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SchoolTuitionBalanceBulkCreate) => SchoolTuitionFeeBalancesService.bulkCreate(payload) as Promise<SchoolTuitionBalanceBulkCreateResult>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.tuition.root() });
    },
  });
}

export function useUpdateSchoolTuitionTermPayment(balanceId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SchoolTermPaymentUpdate) => SchoolTuitionFeeBalancesService.updateTermPayment(balanceId, payload) as Promise<SchoolTuitionFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.tuition.detail(balanceId) });
      qc.invalidateQueries({ queryKey: schoolKeys.tuition.root() });
    },
  });
}

export function useUpdateSchoolBookFeePayment(balanceId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SchoolBookFeePaymentUpdate) => SchoolTuitionFeeBalancesService.updateBookPayment(balanceId, payload) as Promise<SchoolTuitionFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.tuition.detail(balanceId) });
      qc.invalidateQueries({ queryKey: schoolKeys.tuition.root() });
    },
  });
}

// Transport
export function useSchoolTransportBalancesList(params?: { page?: number; page_size?: number; class_id?: number; section_id?: number }) {
  return useQuery({
    queryKey: schoolKeys.transport.list(params as Record<string, unknown> | undefined),
    queryFn: () => SchoolTransportFeeBalancesService.list(params) as Promise<SchoolTransportPaginatedResponse>,
    enabled: !!params?.class_id,
  });
}

export function useSchoolTransportBalance(balanceId: number | null | undefined) {
  return useQuery({
    queryKey: typeof balanceId === "number" ? schoolKeys.transport.detail(balanceId) : [...schoolKeys.transport.root(), "detail", "nil"],
    queryFn: () => SchoolTransportFeeBalancesService.getById(balanceId as number) as Promise<SchoolTransportFeeBalanceFullRead>,
    enabled: typeof balanceId === "number" && balanceId > 0,
  });
}

export function useCreateSchoolTransportBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => SchoolTransportFeeBalancesService.create(payload) as Promise<SchoolTransportFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.transport.root() });
    },
  });
}

export function useUpdateSchoolTransportBalance(balanceId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => SchoolTransportFeeBalancesService.update(balanceId, payload) as Promise<SchoolTransportFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.transport.detail(balanceId) });
      qc.invalidateQueries({ queryKey: schoolKeys.transport.root() });
    },
  });
}

export function useDeleteSchoolTransportBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (balanceId: number) => SchoolTransportFeeBalancesService.delete(balanceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.transport.root() });
    },
  });
}

export function useBulkCreateSchoolTransportBalances() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SchoolTransportBalanceBulkCreate) => SchoolTransportFeeBalancesService.bulkCreate(payload) as Promise<SchoolTransportBalanceBulkCreateResult>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.transport.root() });
    },
  });
}

export function useUpdateSchoolTransportTermPayment(balanceId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SchoolTransportTermPaymentUpdate) => SchoolTransportFeeBalancesService.updateTermPayment(balanceId, payload) as Promise<SchoolTransportFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.transport.detail(balanceId) });
      qc.invalidateQueries({ queryKey: schoolKeys.transport.root() });
    },
  });
}


