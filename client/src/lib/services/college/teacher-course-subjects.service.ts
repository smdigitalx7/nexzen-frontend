import { Api } from "@/lib/api";

export const CollegeTeacherCourseSubjectsService = {
  // GET /api/v1/college/teacher-course-subjects
  list() {
    return Api.get<unknown>(`/college/teacher-course-subjects`);
  },

  // POST /api/v1/college/teacher-course-subjects
  create(payload: unknown) {
    return Api.post<unknown>(`/college/teacher-course-subjects`, payload);
  },

  // DELETE /api/v1/college/teacher-course-subjects/{id}
  delete(id: number) {
    return Api.delete<void>(`/college/teacher-course-subjects/${id}`);
  },
};


