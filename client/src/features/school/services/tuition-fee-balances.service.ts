import { Api } from "@/core/api";
import type { 
  SchoolBookFeePaymentUpdate, 
  SchoolTermPaymentUpdate, 
  SchoolTuitionBalanceBulkCreate, 
  SchoolTuitionBalanceBulkCreateResult, 
  SchoolTuitionFeeBalanceFullRead, 
  SchoolTuitionFeeBalanceRead, 
  SchoolTuitionPaginatedResponse,
  SchoolTuitionFeeBalanceDashboardStats,
  ConcessionUpdateRequest,
  ConcessionUpdateResponse
} from "@/features/school/types";

export const SchoolTuitionFeeBalancesService = {
  list(params: { class_id: number; page?: number; page_size?: number; section_id?: number }) {
    return Api.get<SchoolTuitionPaginatedResponse>(`/school/tuition-fee-balances`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },
  getById(enrollment_id: number) {
    return Api.get<SchoolTuitionFeeBalanceFullRead>(`/school/tuition-fee-balances/${enrollment_id}`);
  },
  create(payload: any) {
    return Api.post<SchoolTuitionFeeBalanceFullRead>(`/school/tuition-fee-balances`, payload);
  },
  update(enrollment_id: number, payload: any) {
    return Api.put<SchoolTuitionFeeBalanceFullRead>(`/school/tuition-fee-balances/${enrollment_id}`, payload);
  },
  delete(enrollment_id: number) {
    return Api.delete<void>(`/school/tuition-fee-balances/${enrollment_id}`);
  },
  bulkCreate(payload: SchoolTuitionBalanceBulkCreate) {
    return Api.post<SchoolTuitionBalanceBulkCreateResult>(`/school/tuition-fee-balances/bulk-create`, payload);
  },
  updateTermPayment(enrollment_id: number, payload: SchoolTermPaymentUpdate) {
    return Api.put<SchoolTuitionFeeBalanceFullRead>(`/school/tuition-fee-balances/${enrollment_id}/pay-term`, payload);
  },
  updateBookPayment(enrollment_id: number, payload: SchoolBookFeePaymentUpdate) {
    return Api.put<SchoolTuitionFeeBalanceFullRead>(`/school/tuition-fee-balances/${enrollment_id}/pay-book-fee`, payload);
  },
  // PUT .../tuition-fee-balances/{enrollment_id}/concession — path param is enrollment_id
  updateConcession(enrollment_id: number, payload: ConcessionUpdateRequest) {
    return Api.put<ConcessionUpdateResponse>(`/school/tuition-fee-balances/${enrollment_id}/concession`, payload);
  },

  getDashboard() {
    return Api.get<SchoolTuitionFeeBalanceDashboardStats>(`/school/tuition-fee-balances/dashboard`);
  },

  getUnpaidTermsReport() {
    return Api.get<any>(`/school/tuition-fee-balances/reports/unpaid-terms`);
  },

  getByAdmission(admission_no: string) {
    return Api.get<SchoolTuitionFeeBalanceFullRead[]>(`/school/tuition-fee-balances/by-admission/${admission_no}`);
  },
};


