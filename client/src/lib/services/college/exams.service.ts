import { Api } from "@/lib/api";

export const CollegeExamsService = {
  // GET /api/v1/college/exams
  list() {
    return Api.get<unknown>(`/college/exams`);
  },

  // GET /api/v1/college/exams/{exam_id}
  getById(exam_id: number) {
    return Api.get<unknown>(`/college/exams/${exam_id}`);
  },
};


