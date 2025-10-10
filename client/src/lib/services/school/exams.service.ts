import { Api } from "@/lib/api";
import type { SchoolExamCreate, SchoolExamRead, SchoolExamUpdate } from "@/lib/types/school";

export const SchoolExamsService = {
  list() {
    return Api.get<SchoolExamRead[]>(`/school/exams`);
  },

  getById(exam_id: number) {
    return Api.get<SchoolExamRead>(`/school/exams/${exam_id}`);
  },

  create(payload: SchoolExamCreate) {
    return Api.post<SchoolExamRead>(`/school/exams`, payload);
  },

  update(exam_id: number, payload: SchoolExamUpdate) {
    return Api.put<SchoolExamRead>(`/school/exams/${exam_id}`, payload);
  },

  delete(exam_id: number) {
    return Api.delete<void>(`/school/exams/${exam_id}`);
  },
};


