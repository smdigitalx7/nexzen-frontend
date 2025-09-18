import { Api } from "@/lib/api";
import type { AdvanceRead, AdvanceCreate, AdvanceUpdate } from "@/lib/types/advances";

export const AdvancesService = {
  list(): Promise<AdvanceRead[]> {
    return Api.get("/advances/");
  },
  listByBranch(): Promise<AdvanceRead[]> {
    return Api.get("/advances/branch");
  },
  getById(id: number): Promise<AdvanceRead> {
    return Api.get(`/advances/${id}`);
  },
  create(payload: AdvanceCreate): Promise<AdvanceRead> {
    return Api.post("/advances/", payload);
  },
  update(id: number, payload: AdvanceUpdate): Promise<AdvanceRead> {
    return Api.put(`/advances/${id}`, payload);
  },
  updateStatus(id: number, status: string): Promise<AdvanceRead> {
    return Api.put(`/advances/${id}/status`, { status } as any);
  },
  updateAmountPaid(id: number, amount_paid: number): Promise<AdvanceRead> {
    return Api.put(`/advances/${id}/amount-paid`, { amount_paid } as any);
  },
};


