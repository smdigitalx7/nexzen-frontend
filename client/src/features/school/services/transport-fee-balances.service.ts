import { Api } from "@/core/api";
import type { 
  SchoolTransportBalanceBulkCreate, 
  SchoolTransportBalanceBulkCreateResult, 
  SchoolTransportFeeBalanceFullRead, 
  SchoolTransportFeeBalanceListRead, 
  SchoolTransportPaginatedResponse, 
  SchoolTransportTermPaymentUpdate,
  SchoolTransportFeeBalanceDashboardStats
} from "@/features/school/types";

export const SchoolTransportFeeBalancesService = {
  list(params: { class_id: number; page?: number; page_size?: number; section_id?: number }) {
    return Api.get<SchoolTransportPaginatedResponse>(`/school/transport-fee-balances`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },
  getById(enrollment_id: number) {
    return Api.get<SchoolTransportFeeBalanceFullRead>(`/school/transport-fee-balances/${enrollment_id}`);
  },
  create(payload: any) {
    return Api.post<SchoolTransportFeeBalanceFullRead>(`/school/transport-fee-balances`, payload);
  },
  update(enrollment_id: number, payload: any) {
    return Api.put<SchoolTransportFeeBalanceFullRead>(`/school/transport-fee-balances/${enrollment_id}`, payload);
  },
  delete(enrollment_id: number) {
    return Api.delete<void>(`/school/transport-fee-balances/${enrollment_id}`);
  },
  bulkCreate(payload: SchoolTransportBalanceBulkCreate) {
    return Api.post<SchoolTransportBalanceBulkCreateResult>(`/school/transport-fee-balances/bulk-create`, payload);
  },
  updateTermPayment(enrollment_id: number, payload: SchoolTransportTermPaymentUpdate) {
    return Api.put<SchoolTransportFeeBalanceFullRead>(`/school/transport-fee-balances/${enrollment_id}/pay-term`, payload);
  },

  getDashboard() {
    return Api.get<SchoolTransportFeeBalanceDashboardStats>(`/school/transport-fee-balances/dashboard`);
  },

  getByAdmission(admission_no: string) {
    return Api.get<SchoolTransportFeeBalanceFullRead[]>(`/school/transport-fee-balances/by-admission/${admission_no}`);
  },
};


