import { Api } from "@/lib/api";

export interface CollegeTuitionBalancesListParams {
  page?: number;
  pageSize?: number;
  admission_no?: string;
}

export const CollegeTuitionBalancesService = {
  // GET /api/v1/college/tuition-fee-balances
  list(params?: CollegeTuitionBalancesListParams) {
    return Api.get<unknown>(`/college/tuition-fee-balances`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  // GET /api/v1/college/tuition-fee-balances/by-admission-no/{admission_no}
  getByAdmissionNo(admission_no: string) {
    return Api.get<unknown>(`/college/tuition-fee-balances/by-admission-no/${admission_no}`);
  },

  // GET /api/v1/college/tuition-fee-balances/{balance_id}
  getById(balance_id: number) {
    return Api.get<unknown>(`/college/tuition-fee-balances/${balance_id}`);
  },

  // POST /api/v1/college/tuition-fee-balances
  create(payload: unknown) {
    return Api.post<unknown>(`/college/tuition-fee-balances`, payload);
  },

  // PUT /api/v1/college/tuition-fee-balances/{balance_id}
  update(balance_id: number, payload: unknown) {
    return Api.put<unknown>(`/college/tuition-fee-balances/${balance_id}`, payload);
  },

  // DELETE /api/v1/college/tuition-fee-balances/{balance_id}
  delete(balance_id: number) {
    return Api.delete<void>(`/college/tuition-fee-balances/${balance_id}`);
  },

  // POST /api/v1/college/tuition-fee-balances/bulk-create
  bulkCreate(payload: unknown) {
    return Api.post<unknown>(`/college/tuition-fee-balances/bulk-create`, payload);
  },

  // GET /api/v1/college/tuition-fee-balances/unpaid-terms/
  getUnpaidTerms(params?: { page?: number; pageSize?: number }) {
    return Api.get<unknown>(`/college/tuition-fee-balances/unpaid-terms/`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  // PUT /api/v1/college/tuition-fee-balances/{balance_id}/term-payment
  updateTermPayment(balance_id: number, payload: unknown) {
    return Api.put<unknown>(`/college/tuition-fee-balances/${balance_id}/term-payment`, payload);
  },

  // PUT /api/v1/college/tuition-fee-balances/{balance_id}/book-payment
  updateBookPayment(balance_id: number, payload: unknown) {
    return Api.put<unknown>(`/college/tuition-fee-balances/${balance_id}/book-payment`, payload);
  },
};


