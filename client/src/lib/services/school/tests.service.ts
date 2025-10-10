import { Api } from "@/lib/api";
import type { SchoolTestCreate, SchoolTestRead, SchoolTestUpdate } from "@/lib/types/school";

export const SchoolTestsService = {
  list() {
    return Api.get<unknown>(`/school/tests`).then((res: any) => {
      if (Array.isArray(res)) return res as SchoolTestRead[];
      if (Array.isArray(res?.data)) return res.data as SchoolTestRead[];
      if (Array.isArray(res?.results)) return res.results as SchoolTestRead[];
      if (res && typeof res === 'object') return [res as SchoolTestRead];
      return [] as SchoolTestRead[];
    });
  },

  getById(test_id: number) {
    return Api.get<unknown>(`/school/tests/${test_id}`).then((res: any) => {
      if (res && !Array.isArray(res)) return res as SchoolTestRead;
      if (res?.data) return res.data as SchoolTestRead;
      return res as SchoolTestRead;
    });
  },

  create(payload: SchoolTestCreate) {
    return Api.post<SchoolTestRead>(`/school/tests`, payload);
  },

  update(test_id: number, payload: SchoolTestUpdate) {
    return Api.put<SchoolTestRead>(`/school/tests/${test_id}`, payload);
  },

  delete(test_id: number) {
    return Api.delete<void>(`/school/tests/${test_id}`);
  },
};


