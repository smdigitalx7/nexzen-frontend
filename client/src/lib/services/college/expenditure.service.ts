import { Api } from "@/lib/api";

export interface CollegeExpenditureListParams {
  start_date?: string; // YYYY-MM-DD
  end_date?: string;   // YYYY-MM-DD
}

export const CollegeExpenditureService = {
  // GET /api/v1/college/expenditure
  list(params?: CollegeExpenditureListParams) {
    return Api.get<unknown>(`/college/expenditure`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  // GET /api/v1/college/expenditure/{expenditure_id}
  getById(expenditure_id: number) {
    return Api.get<unknown>(`/college/expenditure/${expenditure_id}`);
  },
};


