import { Api } from "@/lib/api";

export interface CollegeTestMarksListParams {
  class_id?: number;
  group_id?: number;
  course_id?: number;
  test_id?: number;
  page?: number;
  pageSize?: number;
}

export const CollegeTestMarksService = {
  // GET /api/v1/college/test-marks
  list(params?: CollegeTestMarksListParams) {
    return Api.get<unknown>(`/college/test-marks`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  // GET /api/v1/college/test-marks/{test_mark_id}
  getById(test_mark_id: number) {
    return Api.get<unknown>(`/college/test-marks/${test_mark_id}`);
  },

  // POST /api/v1/college/test-marks
  create(payload: unknown) {
    return Api.post<unknown>(`/college/test-marks`, payload);
  },

  // PUT /api/v1/college/test-marks/{test_mark_id}
  update(test_mark_id: number, payload: unknown) {
    return Api.put<unknown>(`/college/test-marks/${test_mark_id}`, payload);
  },

  // DELETE /api/v1/college/test-marks/{test_mark_id}
  delete(test_mark_id: number) {
    return Api.delete<void>(`/college/test-marks/${test_mark_id}`);
  },

  // POST /api/v1/college/test-marks/bulk-create
  bulkCreate(payload: unknown) {
    return Api.post<unknown>(`/college/test-marks/bulk-create`, payload);
  },
};


