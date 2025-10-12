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

export function useSchoolTuitionBalance(enrollmentId: number | null | undefined) {
  return useQuery({
    queryKey: typeof enrollmentId === "number" ? schoolKeys.tuition.detail(enrollmentId) : [...schoolKeys.tuition.root(), "detail", "nil"],
    queryFn: () => SchoolTuitionFeeBalancesService.getById(enrollmentId as number) as Promise<SchoolTuitionFeeBalanceFullRead>,
    enabled: typeof enrollmentId === "number" && enrollmentId > 0,
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

export function useUpdateSchoolTuitionBalance(enrollmentId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => SchoolTuitionFeeBalancesService.update(enrollmentId, payload) as Promise<SchoolTuitionFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.tuition.detail(enrollmentId) });
      qc.invalidateQueries({ queryKey: schoolKeys.tuition.root() });
    },
  });
}

export function useDeleteSchoolTuitionBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: number) => SchoolTuitionFeeBalancesService.delete(enrollmentId),
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

export function useUpdateSchoolTuitionTermPayment(enrollmentId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SchoolTermPaymentUpdate) => SchoolTuitionFeeBalancesService.updateTermPayment(enrollmentId, payload) as Promise<SchoolTuitionFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.tuition.detail(enrollmentId) });
      qc.invalidateQueries({ queryKey: schoolKeys.tuition.root() });
    },
  });
}

export function useUpdateSchoolBookFeePayment(enrollmentId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SchoolBookFeePaymentUpdate) => SchoolTuitionFeeBalancesService.updateBookPayment(enrollmentId, payload) as Promise<SchoolTuitionFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.tuition.detail(enrollmentId) });
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

export function useSchoolTransportBalance(enrollmentId: number | null | undefined) {
  return useQuery({
    queryKey: typeof enrollmentId === "number" ? schoolKeys.transport.detail(enrollmentId) : [...schoolKeys.transport.root(), "detail", "nil"],
    queryFn: () => SchoolTransportFeeBalancesService.getById(enrollmentId as number) as Promise<SchoolTransportFeeBalanceFullRead>,
    enabled: typeof enrollmentId === "number" && enrollmentId > 0,
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

export function useUpdateSchoolTransportBalance(enrollmentId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => SchoolTransportFeeBalancesService.update(enrollmentId, payload) as Promise<SchoolTransportFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.transport.detail(enrollmentId) });
      qc.invalidateQueries({ queryKey: schoolKeys.transport.root() });
    },
  });
}

export function useDeleteSchoolTransportBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: number) => SchoolTransportFeeBalancesService.delete(enrollmentId),
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

export function useUpdateSchoolTransportTermPayment(enrollmentId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SchoolTransportTermPaymentUpdate) => SchoolTransportFeeBalancesService.updateTermPayment(enrollmentId, payload) as Promise<SchoolTransportFeeBalanceFullRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.transport.detail(enrollmentId) });
      qc.invalidateQueries({ queryKey: schoolKeys.transport.root() });
    },
  });
}


