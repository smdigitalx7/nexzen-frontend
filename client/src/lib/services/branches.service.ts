import { Api } from "@/lib/api";
import type { BranchRead, BranchCreate, BranchUpdate } from "@/lib/types/branches";

export const BranchesService = {
  async list(): Promise<BranchRead[]> {
    return Api.get<BranchRead[]>("/branches/");
  },

  async getById(id: number): Promise<BranchRead> {
    return Api.get<BranchRead>(`/branches/${id}`);
  },

  async create(payload: BranchCreate): Promise<BranchRead> {
    return Api.post<BranchRead>("/branches/", payload);
  },

  async update(id: number, payload: BranchUpdate): Promise<BranchRead> {
    return Api.put<BranchRead>(`/branches/${id}`, payload);
  },

  async remove(id: number): Promise<boolean> {
    return Api.delete<boolean>(`/branches/${id}`) as unknown as boolean;
  },
};


