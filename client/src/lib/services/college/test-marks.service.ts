import { Api } from "@/lib/api";
import { CollegeCreateTestMarkBulk, CollegeTestMarkBulkCreateResult, CollegeTestMarkFullReadResponse, CollegeTestMarkMinimalRead, CollegeTestMarkUpdate, CollegeTestMarksListParams } from "@/lib/types/college";

export const CollegeTestMarksService = {
  // GET /api/v1/college/test-marks
  list(params?: CollegeTestMarksListParams) {
    return Api.get<CollegeTestMarkMinimalRead[]>(`/college/test-marks`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  // GET /api/v1/college/test-marks/{test_mark_id}
  getById(test_mark_id: number) {
    return Api.get<CollegeTestMarkFullReadResponse>(`/college/test-marks/${test_mark_id}`);
  },

  // POST /api/v1/college/test-marks
  create(payload: CollegeTestMarkUpdate) {
    return Api.post<CollegeTestMarkFullReadResponse>(`/college/test-marks`, payload);
  },

  // PUT /api/v1/college/test-marks/{test_mark_id}
  update(test_mark_id: number, payload: CollegeTestMarkUpdate) {
    return Api.put<CollegeTestMarkFullReadResponse>(`/college/test-marks/${test_mark_id}`, payload);
  },

  // DELETE /api/v1/college/test-marks/{test_mark_id}
  delete(test_mark_id: number) {
    return Api.delete<void>(`/college/test-marks/${test_mark_id}`);
  },

  // POST /api/v1/college/test-marks/bulk-create
  bulkCreate(payload: CollegeCreateTestMarkBulk) {
    return Api.post<CollegeTestMarkBulkCreateResult>(`/college/test-marks/bulk-create`, payload);
  },
};


