import { Api } from "@/lib/api";

export const CollegeTestsService = {
  // GET /api/v1/college/tests
  list() {
    return Api.get<unknown>(`/college/tests`);
  },

  // GET /api/v1/college/tests/{test_id}
  getById(test_id: number) {
    return Api.get<unknown>(`/college/tests/${test_id}`);
  },

  // POST /api/v1/college/tests
  create(payload: unknown) {
    return Api.post<unknown>(`/college/tests`, payload);
  },

  // PUT /api/v1/college/tests/{test_id}
  update(test_id: number, payload: unknown) {
    return Api.put<unknown>(`/college/tests/${test_id}`, payload);
  },

  // DELETE /api/v1/college/tests/{test_id}
  delete(test_id: number) {
    return Api.delete<void>(`/college/tests/${test_id}`);
  },
};


