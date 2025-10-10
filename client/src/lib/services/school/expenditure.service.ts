import { Api } from "@/lib/api";
import type { SchoolExpenditureCreate, SchoolExpenditureRead, SchoolExpenditureUpdate } from "@/lib/types/school";

export const SchoolExpenditureService = {
  list(params?: { start_date?: string; end_date?: string }) {
    return Api.get<SchoolExpenditureRead[]>(`/school/expenditure`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  getById(expenditure_id: number) {
    return Api.get<SchoolExpenditureRead>(`/school/expenditure/${expenditure_id}`);
  },

  create(payload: SchoolExpenditureCreate) {
    return Api.post<SchoolExpenditureRead>(`/school/expenditure`, payload);
  },

  update(expenditure_id: number, payload: SchoolExpenditureUpdate) {
    return Api.put<SchoolExpenditureRead>(`/school/expenditure/${expenditure_id}`, payload);
  },

  delete(expenditure_id: number) {
    return Api.delete<void>(`/school/expenditure/${expenditure_id}`);
  },

  getDashboard() {
    return Api.get<any>(`/school/expenditure/dashboard`);
  },

  getRecent() {
    return Api.get<SchoolExpenditureRead[]>(`/school/expenditure/recent`);
  },
};


