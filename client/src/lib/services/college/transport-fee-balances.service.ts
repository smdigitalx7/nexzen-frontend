import { Api } from "@/lib/api";
import { CollegeTransportBalanceBulkCreate, CollegeTransportBalanceBulkCreateResult, CollegeTransportFeeBalanceCreate, CollegeTransportFeeBalanceFullRead, CollegeTransportFeeBalanceListRead, CollegeTransportFeeBalanceUpdate, CollegeTransportPaginatedResponse, CollegeTransportTermPaymentUpdate } from "@/lib/types/college";

export interface CollegeTransportBalancesListParams {
  page?: number;
  pageSize?: number;
}

export const CollegeTransportBalancesService = {
  // GET /api/v1/college/transport-fee-balances/dashboard
  dashboard() {
    return Api.get<unknown>(`/college/transport-fee-balances/dashboard`);
  },

  // GET /api/v1/college/transport-fee-balances
  list(params?: CollegeTransportBalancesListParams) {
    return Api.get<CollegeTransportPaginatedResponse>(`/college/transport-fee-balances`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  // GET /api/v1/college/transport-fee-balances/{balance_id}
  getById(balance_id: number) {
    return Api.get<CollegeTransportFeeBalanceFullRead>(`/college/transport-fee-balances/${balance_id}`);
  },

  // POST /api/v1/college/transport-fee-balances
  create(payload: CollegeTransportFeeBalanceCreate) {
    return Api.post<CollegeTransportFeeBalanceFullRead>(`/college/transport-fee-balances`, payload);
  },

  // PUT /api/v1/college/transport-fee-balances/{balance_id}
  update(balance_id: number, payload: CollegeTransportFeeBalanceUpdate) {
    return Api.put<CollegeTransportFeeBalanceFullRead>(`/college/transport-fee-balances/${balance_id}`, payload);
  },

  // DELETE /api/v1/college/transport-fee-balances/{balance_id}
  delete(balance_id: number) {
    return Api.delete<void>(`/college/transport-fee-balances/${balance_id}`);
  },

  // POST /api/v1/college/transport-fee-balances/bulk-create
  bulkCreate(payload: CollegeTransportBalanceBulkCreate) {
    return Api.post<CollegeTransportBalanceBulkCreateResult>(`/college/transport-fee-balances/bulk-create`, payload);
  },

  // PUT /api/v1/college/transport-fee-balances/{balance_id}/term-payment
  updateTermPayment(balance_id: number, payload: CollegeTransportTermPaymentUpdate) {
    return Api.put<CollegeTransportFeeBalanceFullRead>(`/college/transport-fee-balances/${balance_id}/term-payment`, payload);
  },
};


