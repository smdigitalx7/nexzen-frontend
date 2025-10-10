import { Api } from "@/lib/api";
import type { PayrollRead, PayrollCreate, PayrollUpdate, PayrollQuery, PayrollListResponse } from "@/lib/types/general/payrolls";

export const PayrollsService = {
  list(query?: PayrollQuery): Promise<PayrollListResponse> {
    return Api.get("/payrolls", query as any);
  },
  listByBranch(query?: PayrollQuery): Promise<PayrollListResponse> {
    return Api.get("/payrolls/branch", query as any);
  },
  getById(id: number): Promise<PayrollRead> {
    return Api.get(`/payrolls/${id}`);
  },
  create(payload: PayrollCreate): Promise<PayrollRead> {
    return Api.post("/payrolls", payload);
  },
  update(id: number, payload: PayrollUpdate): Promise<PayrollRead> {
    return Api.put(`/payrolls/${id}`, payload);
  },
  updateStatus(id: number, new_status: string): Promise<PayrollRead> {
    return Api.put(`/payrolls/${id}/status`, new_status);
  },
};


