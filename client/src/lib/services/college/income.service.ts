import { Api } from "@/lib/api";
import { CollegeIncomeCreate, CollegeIncomeCreateReservation, CollegeIncomeRead, CollegeIncomeUpdate, CollegeIncomeDashboardStats, CollegeRecentIncome, CollegeIncomeReceipt } from "@/lib/types/college";

export interface CollegeIncomeListParams {
  admission_no?: string;
  purpose?: string;
  start_date?: string; // YYYY-MM-DD
  end_date?: string;   // YYYY-MM-DD
}

export const CollegeIncomeService = {
  // GET /api/v1/college/income/dashboard
  dashboard() {
    return Api.get<CollegeIncomeDashboardStats>(`/college/income/dashboard`);
  },

  // GET /api/v1/college/income/recent
  recent(limit?: number) {
    return Api.get<CollegeRecentIncome[]>(`/college/income/recent${limit ? `?limit=${limit}` : ''}`);
  },

  // GET /api/v1/college/income
  list(params?: CollegeIncomeListParams) {
    return Api.get<CollegeIncomeRead[]>(`/college/income`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  // GET /api/v1/college/income/{income_id}
  getById(income_id: number) {
    return Api.get<CollegeIncomeRead>(`/college/income/${income_id}`);
  },

  // POST /api/v1/college/income/by-admission/{admission_no}
  createByAdmission(admission_no: string, payload: CollegeIncomeCreate) {
    return Api.post<CollegeIncomeRead>(`/college/income/by-admission/${admission_no}`, payload);
  },

  // PUT /api/v1/college/income/{income_id}
  update(income_id: number, payload: CollegeIncomeUpdate) {
    return Api.put<CollegeIncomeRead>(`/college/income/${income_id}`, payload);
  },

  // POST /api/v1/college/income/by-reservation
  createByReservation(payload: CollegeIncomeCreateReservation) {
    return Api.post<CollegeIncomeRead>(`/college/income/by-reservation`, payload);
  },

  // POST /api/v1/college/income/pay-by-admission/{admission_no}
  payByAdmission(admission_no: string, payload: CollegeIncomeCreate) {
    return Api.post<CollegeIncomeRead>(`/college/income/pay-by-admission/${admission_no}`, payload);
  },

  // POST /api/v1/college/income/pay-by-reservation/{reservation_id}
  payByReservation(reservation_id: number, payload: CollegeIncomeCreateReservation) {
    return Api.post<CollegeIncomeRead>(`/college/income/pay-by-reservation/${reservation_id}`, payload);
  },

  // GET /api/v1/college/income/{income_id}/details
  getIncomeWithDetails(income_id: number) {
    return Api.get<CollegeIncomeRead>(`/college/income/${income_id}/details`);
  },

  // GET /api/v1/college/income/{income_id}/receipt
  getIncomeReceipt(income_id: number) {
    return Api.get<CollegeIncomeReceipt>(`/college/income/${income_id}/receipt`);
  },

  // GET /api/v1/college/income/{income_id}/regenerate-receipt
  regenerateReceipt(income_id: number) {
    return Api.get<Blob>(`/college/income/${income_id}/regenerate-receipt`, {
      responseType: 'blob'
    });
  },

  // GET /api/v1/college/income?reservation_id={reservation_id}
  getByReservationId(reservation_id: number) {
    return Api.get<CollegeIncomeRead[]>(`/college/income`, { reservation_id });
  },
};


