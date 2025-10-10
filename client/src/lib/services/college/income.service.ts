import { Api } from "@/lib/api";

export interface CollegeIncomeListParams {
  admission_no?: string;
  purpose?: string;
  start_date?: string; // YYYY-MM-DD
  end_date?: string;   // YYYY-MM-DD
}

export const CollegeIncomeService = {
  // GET /api/v1/college/income
  list(params?: CollegeIncomeListParams) {
    return Api.get<unknown>(`/college/income`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  // GET /api/v1/college/income/{income_id}
  getById(income_id: number) {
    return Api.get<unknown>(`/college/income/${income_id}`);
  },

  // POST /api/v1/college/income/by-admission/{admission_no}
  createByAdmission(admission_no: string, payload: unknown) {
    return Api.post<unknown>(`/college/income/by-admission/${admission_no}`, payload);
  },

  // PUT /api/v1/college/income/{income_id}
  update(income_id: number, payload: unknown) {
    return Api.put<unknown>(`/college/income/${income_id}`, payload);
  },

  // POST /api/v1/college/income/by-reservation
  createByReservation(payload: unknown) {
    return Api.post<unknown>(`/college/income/by-reservation`, payload);
  },
};


