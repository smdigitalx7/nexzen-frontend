import { Api } from "@/lib/api";

export interface CollegeExamMarksListParams {
  class_id?: number;
  group_id?: number;
  course_id?: number;
  exam_id?: number;
  page?: number;
  pageSize?: number;
}

export const CollegeExamMarksService = {
  // GET /api/v1/college/exam-marks
  list(params?: CollegeExamMarksListParams) {
    return Api.get<unknown>(`/college/exam-marks`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  // GET /api/v1/college/exam-marks/{mark_id}
  getById(mark_id: number) {
    return Api.get<unknown>(`/college/exam-marks/${mark_id}`);
  },

  // POST /api/v1/college/exam-marks
  create(payload: unknown) {
    return Api.post<unknown>(`/college/exam-marks`, payload);
  },

  // PUT /api/v1/college/exam-marks/{mark_id}
  update(mark_id: number, payload: unknown) {
    return Api.put<unknown>(`/college/exam-marks/${mark_id}`, payload);
  },

  // DELETE /api/v1/college/exam-marks/{mark_id}
  delete(mark_id: number) {
    return Api.delete<void>(`/college/exam-marks/${mark_id}`);
  },

  // POST /api/v1/college/exam-marks/bulk-create
  bulkCreate(payload: unknown) {
    return Api.post<unknown>(`/college/exam-marks/bulk-create`, payload);
  },
};


