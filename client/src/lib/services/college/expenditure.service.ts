import { Api } from "@/lib/api";
import { CollegeExpenditureCreate, CollegeExpenditureRead, CollegeExpenditureUpdate } from "@/lib/types/college";

export interface CollegeExpenditureListParams {
  start_date?: string; // YYYY-MM-DD
  end_date?: string;   // YYYY-MM-DD
}

export const CollegeExpenditureService = {
  // GET /api/v1/college/expenditure/dashboard
  dashboard() {
    return Api.get<unknown>(`/college/expenditure/dashboard`);
  },

  // GET /api/v1/college/expenditure/recent
  recent() {
    return Api.get<unknown>(`/college/expenditure/recent`);
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
};


