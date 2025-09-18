import { Api } from "@/lib/api";
import type { RoleRead, RoleUpdate } from "@/lib/types/roles";

export const RolesService = {
  list(): Promise<RoleRead[]> {
    return Api.get("/roles/");
  },
  getById(id: number): Promise<RoleRead> {
    return Api.get(`/roles/${id}`);
  },
  update(id: number, payload: RoleUpdate): Promise<{ message: string }> {
    return Api.put(`/roles/${id}`, payload) as unknown as Promise<{ message: string }>;
  },
};


