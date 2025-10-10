import { Api } from "@/lib/api";
import type { SchoolTransportBalanceBulkCreate, SchoolTransportBalanceBulkCreateResult, SchoolTransportFeeBalanceFullRead, SchoolTransportFeeBalanceListRead, SchoolTransportPaginatedResponse, SchoolTransportTermPaymentUpdate } from "@/lib/types/school";

export const SchoolTransportFeeBalancesService = {
  list(params?: { page?: number; page_size?: number; class_id?: number }) {
    return Api.get<SchoolTransportPaginatedResponse>(`/school/transport-fee-balances`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },
  getById(balance_id: number) {
    return Api.get<SchoolTransportFeeBalanceFullRead>(`/school/transport-fee-balances/${balance_id}`);
  },
  create(payload: any) {
    return Api.post<SchoolTransportFeeBalanceFullRead>(`/school/transport-fee-balances`, payload);
  },
  update(balance_id: number, payload: any) {
    return Api.put<SchoolTransportFeeBalanceFullRead>(`/school/transport-fee-balances/${balance_id}`, payload);
  },
  delete(balance_id: number) {
    return Api.delete<void>(`/school/transport-fee-balances/${balance_id}`);
  },
  bulkCreate(payload: SchoolTransportBalanceBulkCreate) {
    return Api.post<SchoolTransportBalanceBulkCreateResult>(`/school/transport-fee-balances/bulk-create`, payload);
  },
  updateTermPayment(balance_id: number, payload: SchoolTransportTermPaymentUpdate) {
    return Api.put<SchoolTransportFeeBalanceFullRead>(`/school/transport-fee-balances/${balance_id}/pay-term`, payload);
  },

  getDashboard() {
    return Api.get<any>(`/school/transport-fee-balances/dashboard`);
  },

  getByAdmission(admission_no: string) {
    return Api.get<SchoolTransportFeeBalanceFullRead[]>(`/school/transport-fee-balances/by-admission/${admission_no}`);
  },
};


