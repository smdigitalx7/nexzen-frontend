import { Api } from "@/lib/api";
import type { SchoolIncomeCreate, SchoolIncomeCreateReservation, SchoolIncomeRead, SchoolIncomeUpdate } from "@/lib/types/school";

export const SchoolIncomeService = {
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

  getDashboard() {
    return Api.get<any>(`/school/income/dashboard`);
  },

  getRecent() {
    return Api.get<SchoolIncomeRead[]>(`/school/income/recent`);
  },
};


