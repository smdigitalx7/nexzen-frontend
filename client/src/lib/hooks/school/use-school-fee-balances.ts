import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolTuitionFeeBalancesService } from "@/lib/services/school/tuition-fee-balances.service";
import { SchoolTransportFeeBalancesService } from "@/lib/services/school/transport-fee-balances.service";
import type { SchoolBookFeePaymentUpdate, SchoolTermPaymentUpdate, SchoolTransportBalanceBulkCreate, SchoolTransportBalanceBulkCreateResult, SchoolTransportFeeBalanceFullRead, SchoolTransportFeeBalanceListRead, SchoolTransportPaginatedResponse, SchoolTransportTermPaymentUpdate, SchoolTuitionBalanceBulkCreate, SchoolTuitionBalanceBulkCreateResult, SchoolTuitionFeeBalanceFullRead, SchoolTuitionFeeBalanceRead, SchoolTuitionPaginatedResponse } from "@/lib/types/school";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

// Tuition
export function useSchoolTuitionBalancesList(params?: { page?: number; page_size?: number; class_id?: number; section_id?: number }) {
  return useQuery({
    queryKey: schoolKeys.tuition.list(params as Record<string, unknown> | undefined),
    queryFn: () => SchoolTuitionFeeBalancesService.list(params),
    enabled: !!params?.class_id,
  });
}

export function useSchoolTuitionBalance(enrollmentId: number | null | undefined) {
  return useQuery({
    queryKey: typeof enrollmentId === "number" ? schoolKeys.tuition.detail(enrollmentId) : [...schoolKeys.tuition.root(), "detail", "nil"],
    queryFn: () => SchoolTuitionFeeBalancesService.getById(enrollmentId as number),
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
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: any) => SchoolTuitionFeeBalancesService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.tuition.root() });
    },
  }, "Tuition balance created successfully");
}

export function useUpdateSchoolTuitionBalance(enrollmentId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: any) => SchoolTuitionFeeBalancesService.update(enrollmentId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.tuition.detail(enrollmentId) });
      qc.invalidateQueries({ queryKey: schoolKeys.tuition.root() });
    },
  }, "Tuition balance updated successfully");
}

export function useDeleteSchoolTuitionBalance() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (enrollmentId: number) => SchoolTuitionFeeBalancesService.delete(enrollmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.tuition.root() });
    },
  }, "Tuition balance deleted successfully");
}

export function useBulkCreateSchoolTuitionBalances() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolTuitionBalanceBulkCreate) => SchoolTuitionFeeBalancesService.bulkCreate(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.tuition.root() });
    },
  }, "Tuition balances created successfully");
}

export function useUpdateSchoolTuitionTermPayment(enrollmentId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolTermPaymentUpdate) => SchoolTuitionFeeBalancesService.updateTermPayment(enrollmentId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.tuition.detail(enrollmentId) });
      qc.invalidateQueries({ queryKey: schoolKeys.tuition.root() });
    },
  }, "Tuition payment updated successfully");
}

export function useUpdateSchoolBookFeePayment(enrollmentId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolBookFeePaymentUpdate) => SchoolTuitionFeeBalancesService.updateBookPayment(enrollmentId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.tuition.detail(enrollmentId) });
      qc.invalidateQueries({ queryKey: schoolKeys.tuition.root() });
    },
  }, "Book fee payment updated successfully");
}

// Transport
export function useSchoolTransportBalancesList(params?: { page?: number; page_size?: number; class_id?: number; section_id?: number }) {
  return useQuery({
    queryKey: schoolKeys.transport.list(params as Record<string, unknown> | undefined),
    queryFn: () => SchoolTransportFeeBalancesService.list(params),
    enabled: !!params?.class_id,
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
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: any) => SchoolTransportFeeBalancesService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.transport.root() });
    },
  }, "Transport balance created successfully");
}

export function useUpdateSchoolTransportBalance(enrollmentId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: any) => SchoolTransportFeeBalancesService.update(enrollmentId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.transport.detail(enrollmentId) });
      qc.invalidateQueries({ queryKey: schoolKeys.transport.root() });
    },
  }, "Transport balance updated successfully");
}

export function useDeleteSchoolTransportBalance() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (enrollmentId: number) => SchoolTransportFeeBalancesService.delete(enrollmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.transport.root() });
    },
  }, "Transport balance deleted successfully");
}

export function useBulkCreateSchoolTransportBalances() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolTransportBalanceBulkCreate) => SchoolTransportFeeBalancesService.bulkCreate(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.transport.root() });
    },
  }, "Transport balances created successfully");
}

export function useUpdateSchoolTransportTermPayment(enrollmentId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolTransportTermPaymentUpdate) => SchoolTransportFeeBalancesService.updateTermPayment(enrollmentId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.transport.detail(enrollmentId) });
      qc.invalidateQueries({ queryKey: schoolKeys.transport.root() });
    },
  }, "Transport payment updated successfully");
}


