import { Api } from "@/lib/api";
import { CollegeBookFeePaymentUpdate, CollegeTermPaymentUpdate, CollegeTuitionBalanceBulkCreate, CollegeTuitionBalanceBulkCreateResult, CollegeTuitionFeeBalanceCreate, CollegeTuitionFeeBalanceFullRead, CollegeTuitionFeeBalanceRead, CollegeTuitionPaginatedResponse, CollegeTuitionUnpaidTermsResponse, CollegeTuitionFeeBalanceDashboardStats } from "@/lib/types/college";

export interface CollegeTuitionBalancesListParams {
  class_id: number; // Required
  group_id: number; // Required
  page?: number;
  pageSize?: number;
  admission_no?: string;
  course_id?: number;
}

export const CollegeTuitionBalancesService = {
  // GET /api/v1/college/tuition-fee-balances/dashboard
  dashboard() {
    return Api.get<CollegeTuitionFeeBalanceDashboardStats>(`/college/tuition-fee-balances/dashboard`);
  },
  // GET /api/v1/college/tuition-fee-balances
  list(params: CollegeTuitionBalancesListParams) {
    return Api.get<CollegeTuitionPaginatedResponse>(`/college/tuition-fee-balances`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  // GET /api/v1/college/tuition-fee-balances/by-admission-no/{admission_no}
  getByAdmissionNo(admission_no: string) {
    return Api.get<CollegeTuitionFeeBalanceFullRead>(`/college/tuition-fee-balances/by-admission-no/${admission_no}`);
  },

  // GET /api/v1/college/tuition-fee-balances/{enrollment_id}
  getById(enrollment_id: number, options?: { cache?: boolean }) {
    return Api.get<CollegeTuitionFeeBalanceFullRead>(
      `/college/tuition-fee-balances/${enrollment_id}`,
      undefined,
      undefined,
      options
    );
  },

  // POST /api/v1/college/tuition-fee-balances
  create(payload: CollegeTuitionFeeBalanceCreate) {
    return Api.post<CollegeTuitionFeeBalanceFullRead>(`/college/tuition-fee-balances`, payload);
  },

  // POST /api/v1/college/tuition-fee-balances/bulk-create
  bulkCreate(payload: CollegeTuitionBalanceBulkCreate) {
    return Api.post<CollegeTuitionBalanceBulkCreateResult>(`/college/tuition-fee-balances/bulk-create`, payload);
  },

  // GET /api/v1/college/tuition-fee-balances/reports/unpaid-terms/
  getUnpaidTerms(params?: { page?: number; pageSize?: number }) {
    return Api.get<CollegeTuitionUnpaidTermsResponse>(`/college/tuition-fee-balances/reports/unpaid-terms`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  // PUT /api/v1/college/tuition-fee-balances/{enrollment_id}/term-payment
  updateTermPayment(enrollment_id: number, payload: CollegeTermPaymentUpdate) {
    return Api.put<CollegeTuitionFeeBalanceFullRead>(`/college/tuition-fee-balances/${enrollment_id}/term-payment`, payload);
  },

  // PUT /api/v1/college/tuition-fee-balances/{enrollment_id}/book-payment
  updateBookPayment(enrollment_id: number, payload: CollegeBookFeePaymentUpdate) {
    return Api.put<CollegeTuitionFeeBalanceFullRead>(`/college/tuition-fee-balances/${enrollment_id}/book-payment`, payload);
  },
};
