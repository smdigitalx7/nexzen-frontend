import { Api } from "@/lib/api";

export interface CollegeTransportBalancesListParams {
  page?: number;
  pageSize?: number;
}

export const CollegeTransportBalancesService = {
  // GET /api/v1/college/transport-fee-balances
  list(params?: CollegeTransportBalancesListParams) {
    return Api.get<unknown>(`/college/transport-fee-balances`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  // GET /api/v1/college/transport-fee-balances/{balance_id}
  getById(balance_id: number) {
    return Api.get<unknown>(`/college/transport-fee-balances/${balance_id}`);
  },

  // POST /api/v1/college/transport-fee-balances
  create(payload: unknown) {
    return Api.post<unknown>(`/college/transport-fee-balances`, payload);
  },

  // PUT /api/v1/college/transport-fee-balances/{balance_id}
  update(balance_id: number, payload: unknown) {
    return Api.put<unknown>(`/college/transport-fee-balances/${balance_id}`, payload);
  },

  // DELETE /api/v1/college/transport-fee-balances/{balance_id}
  delete(balance_id: number) {
    return Api.delete<void>(`/college/transport-fee-balances/${balance_id}`);
  },

  // POST /api/v1/college/transport-fee-balances/bulk-create
  bulkCreate(payload: unknown) {
    return Api.post<unknown>(`/college/transport-fee-balances/bulk-create`, payload);
  },

  // PUT /api/v1/college/transport-fee-balances/{balance_id}/term-payment
  updateTermPayment(balance_id: number, payload: unknown) {
    return Api.put<unknown>(`/college/transport-fee-balances/${balance_id}/term-payment`, payload);
  },
};


