import { Api } from "@/core/api";
import type {
  CreateTestMarkBulk,
  TestMarkBulkCreateResult,
  TestMarkFullReadResponse,
  TestMarksQuery,
  TestGroupAndSubjectResponse,
  TestMarkCreate,
  TestMarkUpdate,
  CreateTestMarksMultipleSubjects,
  TestMarksMultipleSubjectsResult,
} from "@/features/school/types";

export const SchoolTestMarksService = {
  list(params?: TestMarksQuery) {
    return Api.get<TestGroupAndSubjectResponse[]>(`/school/test-marks`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  getById(test_mark_id: number) {
    return Api.get<TestMarkFullReadResponse>(`/school/test-marks/${test_mark_id}`);
  },

  create(payload: TestMarkCreate) {
    return Api.post<TestMarkFullReadResponse>(`/school/test-marks`, payload);
  },

  update(test_mark_id: number, payload: TestMarkUpdate) {
    return Api.put<TestMarkFullReadResponse>(`/school/test-marks/${test_mark_id}`, payload);
  },

  delete(test_mark_id: number) {
    return Api.delete<void>(`/school/test-marks/${test_mark_id}`);
  },

  bulkCreate(payload: CreateTestMarkBulk) {
    return Api.post<TestMarkBulkCreateResult>(`/school/test-marks/bulk-create`, payload);
  },

  createMultipleSubjects(payload: CreateTestMarksMultipleSubjects) {
    return Api.post<TestMarksMultipleSubjectsResult>(`/school/test-marks/multiple-subjects`, payload);
  },
};
