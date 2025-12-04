import { Api } from "@/core/api";
import { CollegeExpenditureCreate, CollegeExpenditureRead, CollegeExpenditureUpdate, CollegeExpenditureDashboardStats, CollegeRecentExpenditure } from "@/features/college/types";

export interface CollegeExpenditureListParams {
  start_date?: string; // YYYY-MM-DD
  end_date?: string;   // YYYY-MM-DD
  page?: number;       // Optional pagination
  page_size?: number;  // Optional pagination
}

export const CollegeExpenditureService = {
  // GET /api/v1/college/expenditure/dashboard
  dashboard() {
    return Api.get<CollegeExpenditureDashboardStats>(`/college/expenditure/dashboard`);
  },

  // GET /api/v1/college/expenditure/recent
  recent(limit?: number) {
    return Api.get<CollegeRecentExpenditure[]>(`/college/expenditure/recent${limit ? `?limit=${limit}` : ''}`);
  },

  // GET /api/v1/college/expenditure
  list(params?: CollegeExpenditureListParams) {
    return Api.get<CollegeExpenditureRead[]>(`/college/expenditure`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  // GET /api/v1/college/expenditure/{expenditure_id}
  getById(expenditure_id: number) {
    return Api.get<CollegeExpenditureRead>(`/college/expenditure/${expenditure_id}`);
  },

  // POST /api/v1/college/expenditure
  create(payload: CollegeExpenditureCreate) {
    return Api.post<CollegeExpenditureRead>(`/college/expenditure`, payload);
  },

  // PUT /api/v1/college/expenditure/{expenditure_id}
  update(expenditure_id: number, payload: CollegeExpenditureUpdate) {
    return Api.put<CollegeExpenditureRead>(`/college/expenditure/${expenditure_id}`, payload);
  },

  // DELETE /api/v1/college/expenditure/{expenditure_id}
  delete(expenditure_id: number) {
    return Api.delete<void>(`/college/expenditure/${expenditure_id}`);
  },

  // PATCH /api/v1/college/expenditure/{expenditure_id}/status
  updateStatus(expenditure_id: number, status: "PENDING" | "APPROVED" | "REJECTED") {
    return Api.patch<CollegeExpenditureRead>(
      `/college/expenditure/${expenditure_id}/status`,
      null,
      undefined,
      { query: { status } }
    );
  },
};


