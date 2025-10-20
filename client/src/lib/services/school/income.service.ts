import { Api } from "@/lib/api";
import type { 
  SchoolIncomeCreate, 
  SchoolIncomeCreateReservation, 
  SchoolIncomeRead, 
  SchoolIncomeUpdate,
  SchoolIncomeDashboardStats,
  SchoolRecentIncome
} from "@/lib/types/school";

export const SchoolIncomeService = {  

  getDashboard() {
    return Api.get<SchoolIncomeDashboardStats>(`/school/income/dashboard`);
  },

  getRecent(limit?: number) {
    return Api.get<SchoolRecentIncome[]>(`/school/income/recent${limit ? `?limit=${limit}` : ''}`);
  },

  list(params?: { admission_no?: string; purpose?: string; start_date?: string; end_date?: string }) {
    return Api.get<SchoolIncomeRead[]>(`/school/income`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },
  
  getById(income_id: number) {
    return Api.get<SchoolIncomeRead>(`/school/income/${income_id}`);
  },

  create(payload: SchoolIncomeCreate) {
    return Api.post<SchoolIncomeRead>(`/school/income`, payload);
  },

  createByAdmission(admission_no: string, payload: SchoolIncomeCreate) {
    return Api.post<SchoolIncomeRead>(`/school/income/by-admission/${admission_no}`, payload);
  },

  update(income_id: number, payload: SchoolIncomeUpdate) {
    return Api.put<SchoolIncomeRead>(`/school/income/${income_id}`, payload);
  },

  createByReservation(payload: SchoolIncomeCreateReservation) {
    return Api.post<SchoolIncomeRead>(`/school/income/by-reservation`, payload);
  },



  

  payFeeByAdmission(admission_no: string, payload: SchoolIncomeCreate) {
    return Api.post<SchoolIncomeRead>(`/school/income/pay-fee/${admission_no}`, payload);
  },

  payFeeByReservation(reservation_no: string, payload: { details: Array<{ purpose: string; custom_purpose_name?: string; term_number?: number; paid_amount: number; payment_method: string }>; remarks?: string }) {
    return Api.post<any>(`/school/income/pay-fee-by-reservation/${reservation_no}`, payload);
  },

  getIncomeWithDetails(income_id: number) {
    return Api.get<SchoolIncomeRead>(`/school/income/${income_id}/details`);
  },

  getIncomeReceipt(income_id: number) {
    return Api.get<any>(`/school/income/${income_id}/receipt`);
  },
};


