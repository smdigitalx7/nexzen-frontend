import { Api } from "@/core/api";
import { CollegeCreateTestMarkBulk, CollegeTestMarkBulkCreateResult, CollegeTestMarkCreate, CollegeTestMarkFullReadResponse, CollegeTestMarkMinimalRead, CollegeTestMarkUpdate, CollegeTestMarksListParams, CollegeCreateTestMarksMultipleSubjects, CollegeTestMarksMultipleSubjectsResult } from "@/features/college/types";

export const CollegeTestMarksService = {
  // GET /api/v1/college/test-marks
  list(params?: CollegeTestMarksListParams) {
    return Api.get<CollegeTestMarkMinimalRead[]>(`/college/test-marks`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  // GET /api/v1/college/test-marks/{mark_id}
  getById(mark_id: number) {
    return Api.get<CollegeTestMarkFullReadResponse>(`/college/test-marks/${mark_id}`);
  },

  // POST /api/v1/college/test-marks
  create(payload: CollegeTestMarkCreate) {
    return Api.post<CollegeTestMarkFullReadResponse>(`/college/test-marks`, payload);
  },

  // PUT /api/v1/college/test-marks/{mark_id}
  update(mark_id: number, payload: CollegeTestMarkUpdate) {
    return Api.put<CollegeTestMarkFullReadResponse>(`/college/test-marks/${mark_id}`, payload);
  },

  // DELETE /api/v1/college/test-marks/{mark_id}
  delete(mark_id: number) {
    return Api.delete<void>(`/college/test-marks/${mark_id}`);
  },

  // POST /api/v1/college/test-marks/bulk-create
  bulkCreate(payload: CollegeCreateTestMarkBulk) {
    return Api.post<CollegeTestMarkBulkCreateResult>(`/college/test-marks/bulk-create`, payload);
  },

  // POST /api/v1/college/test-marks/multiple-subjects
  createMultipleSubjects(payload: CollegeCreateTestMarksMultipleSubjects) {
    return Api.post<CollegeTestMarksMultipleSubjectsResult>(`/college/test-marks/multiple-subjects`, payload);
  },
};
