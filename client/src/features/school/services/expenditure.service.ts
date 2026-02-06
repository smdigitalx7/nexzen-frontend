import { Api } from "@/core/api";
import type { SchoolExpenditureCreate, SchoolExpenditureRead, SchoolExpenditureUpdate, SchoolExpenditureDashboardStats, SchoolRecentExpenditure, SchoolExpenditureListResponse } from "@/features/school/types";

export const SchoolExpenditureService = {
  list(params?: { start_date?: string; end_date?: string; page?: number; page_size?: number }) {
    return Api.get<SchoolExpenditureListResponse>(`/school/expenditure`, params as Record<string, string | number | boolean | null | undefined> | undefined);
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
    return Api.get<SchoolExpenditureDashboardStats>(`/school/expenditure/dashboard`);
  },

  getRecent(limit?: number) {
    return Api.get<SchoolRecentExpenditure[]>(`/school/expenditure/recent${limit ? `?limit=${limit}` : ''}`);
  },

  // PATCH /api/v1/school/expenditure/{expenditure_id}/status
  updateStatus(expenditure_id: number, status: "PENDING" | "APPROVED" | "REJECTED") {
    return Api.patch<SchoolExpenditureRead>(
      `/school/expenditure/${expenditure_id}/status`,
      null,
      undefined,
      { query: { status } }
    );
  },
};


