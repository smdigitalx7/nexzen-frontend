import { Api } from "@/lib/api";
import { CollegeTransportBalanceBulkCreate, CollegeTransportBalanceBulkCreateResult, CollegeTransportFeeBalanceCreate, CollegeTransportFeeBalanceFullRead, CollegeTransportFeeBalanceListRead, CollegeTransportFeeBalanceUpdate, CollegeTransportPaginatedResponse, CollegeTransportTermPaymentUpdate, CollegeTransportFeeBalanceDashboardStats } from "@/lib/types/college";

export interface CollegeTransportBalancesListParams {
  page?: number;
  pageSize?: number;
  class_id?: number;
  group_id?: number;
}

export const CollegeTransportBalancesService = {
  // GET /api/v1/college/transport-fee-balances/dashboard
  dashboard() {
    return Api.get<CollegeTransportFeeBalanceDashboardStats>(`/college/transport-fee-balances/dashboard`);
  },

  // GET /api/v1/college/transport-fee-balances
  list(params?: CollegeTransportBalancesListParams) {
    return Api.get<CollegeTransportPaginatedResponse>(`/college/transport-fee-balances`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  // GET /api/v1/college/transport-fee-balances/{enrollment_id}
  getById(enrollment_id: number) {
    return Api.get<CollegeTransportFeeBalanceFullRead>(`/college/transport-fee-balances/${enrollment_id}`);
  },

  // POST /api/v1/college/transport-fee-balances
  create(payload: CollegeTransportFeeBalanceCreate) {
    return Api.post<CollegeTransportFeeBalanceFullRead>(`/college/transport-fee-balances`, payload);
  },

  // PUT /api/v1/college/transport-fee-balances/{enrollment_id}
  update(enrollment_id: number, payload: CollegeTransportFeeBalanceUpdate) {
    return Api.put<CollegeTransportFeeBalanceFullRead>(`/college/transport-fee-balances/${enrollment_id}`, payload);
  },

  // DELETE /api/v1/college/transport-fee-balances/{enrollment_id}
  delete(enrollment_id: number) {
    return Api.delete<void>(`/college/transport-fee-balances/${enrollment_id}`);
  },

  // POST /api/v1/college/transport-fee-balances/bulk-create
  bulkCreate(payload: CollegeTransportBalanceBulkCreate) {
    return Api.post<CollegeTransportBalanceBulkCreateResult>(`/college/transport-fee-balances/bulk-create`, payload);
  },

  // PUT /api/v1/college/transport-fee-balances/{enrollment_id}/term-payment
  updateTermPayment(enrollment_id: number, payload: CollegeTransportTermPaymentUpdate) {
    return Api.put<CollegeTransportFeeBalanceFullRead>(`/college/transport-fee-balances/${enrollment_id}/term-payment`, payload);
  },
};


