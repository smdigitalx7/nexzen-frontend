import { Api } from "@/lib/api";
import type {
  CreateExamMarkBulk,
  ExamMarkBulkCreateResult,
  ExamMarkFullReadResponse,
  ExamMarksQuery,
  ExamGroupAndSubjectResponse,
  ExamMarkCreate,
  ExamMarkUpdate,
} from "@/lib/types/school";

export const SchoolExamMarksService = {
  list(params?: ExamMarksQuery) {
    return Api.get<ExamGroupAndSubjectResponse[]>(`/school/exam-marks`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  getById(mark_id: number) {
    return Api.get<ExamMarkFullReadResponse>(`/school/exam-marks/${mark_id}`);
  },

  create(payload: ExamMarkCreate) {
    return Api.post<ExamMarkFullReadResponse>(`/school/exam-marks`, payload);
  },

  update(mark_id: number, payload: ExamMarkUpdate) {
    return Api.put<ExamMarkFullReadResponse>(`/school/exam-marks/${mark_id}`, payload);
  },

  delete(mark_id: number) {
    return Api.delete<void>(`/school/exam-marks/${mark_id}`);
  },

  bulkCreate(payload: CreateExamMarkBulk) {
    return Api.post<ExamMarkBulkCreateResult>(`/school/exam-marks/bulk-create`, payload);
  },
};


