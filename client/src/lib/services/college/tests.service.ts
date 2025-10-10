import { Api } from "@/lib/api";
import { CollegeTestRead, CollegeTestResponse, CollegeTestCreate, CollegeTestUpdate } from "@/lib/types/college";

export const CollegeTestsService = {
  // GET /api/v1/college/tests
  list() {
    return Api.get<CollegeTestRead[]>(`/college/tests`);
  },

  // GET /api/v1/college/tests/{test_id}
  getById(test_id: number) {
    return Api.get<CollegeTestResponse>(`/college/tests/${test_id}`);
  },

  // POST /api/v1/college/tests
  create(payload: CollegeTestCreate) {
    return Api.post<CollegeTestResponse>(`/college/tests`, payload);
  },

  // PUT /api/v1/college/tests/{test_id}
  update(test_id: number, payload: CollegeTestUpdate) {
    return Api.put<CollegeTestResponse>(`/college/tests/${test_id}`, payload);
  },

  // DELETE /api/v1/college/tests/{test_id}
  delete(test_id: number) {
    return Api.delete<void>(`/college/tests/${test_id}`);
  },
};
