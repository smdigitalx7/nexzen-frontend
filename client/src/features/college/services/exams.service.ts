import { Api } from "@/core/api";
import { CollegeExamRead, CollegeExamResponse, CollegeExamCreate, CollegeExamUpdate } from "@/features/college/types";

export const CollegeExamsService = {
  // GET /api/v1/college/exams
  list() {
    return Api.get<CollegeExamRead[]>(`/college/exams`);
  },

  // GET /api/v1/college/exams/{exam_id}
  getById(exam_id: number) {
    return Api.get<CollegeExamResponse>(`/college/exams/${exam_id}`);
  },

  // POST /api/v1/college/exams
  create(payload: CollegeExamCreate) {
    return Api.post<CollegeExamResponse>(`/college/exams`, payload);
  },

  // PUT /api/v1/college/exams/{exam_id}
  update(exam_id: number, payload: CollegeExamUpdate) {
    return Api.put<CollegeExamResponse>(`/college/exams/${exam_id}`, payload);
  },

  // DELETE /api/v1/college/exams/{exam_id}
  delete(exam_id: number) {
    return Api.delete<void>(`/college/exams/${exam_id}`);
  },
};


