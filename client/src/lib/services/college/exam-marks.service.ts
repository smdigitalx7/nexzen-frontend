import { Api } from "@/lib/api";
import { CollegeCreateExamMarkBulk, CollegeExamMarkBulkCreateResult, CollegeExamMarkFullReadResponse, CollegeExamMarkMinimalRead, CollegeExamMarkUpdate, CollegeExamMarksListParams } from "@/lib/types/college";

export const CollegeExamMarksService = {
  // GET /api/v1/college/exam-marks
  list(params?: CollegeExamMarksListParams) {
    return Api.get<CollegeExamMarkMinimalRead[]>(`/college/exam-marks`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  // GET /api/v1/college/exam-marks/{mark_id}
  getById(mark_id: number) {
    return Api.get<CollegeExamMarkFullReadResponse>(`/college/exam-marks/${mark_id}`);
  },

  // POST /api/v1/college/exam-marks
  create(payload: CollegeExamMarkUpdate) {
    return Api.post<CollegeExamMarkFullReadResponse>(`/college/exam-marks`, payload);
  },

  // PUT /api/v1/college/exam-marks/{mark_id}
  update(mark_id: number, payload: CollegeExamMarkUpdate) {
    return Api.put<CollegeExamMarkFullReadResponse>(`/college/exam-marks/${mark_id}`, payload);
  },

  // DELETE /api/v1/college/exam-marks/{mark_id}
  delete(mark_id: number) {
    return Api.delete<void>(`/college/exam-marks/${mark_id}`);
  },

  // POST /api/v1/college/exam-marks/bulk-create
  bulkCreate(payload: CollegeCreateExamMarkBulk) {
    return Api.post<CollegeExamMarkBulkCreateResult>(`/college/exam-marks/bulk-create`, payload);
  },
};


