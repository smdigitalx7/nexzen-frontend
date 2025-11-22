import { Api } from "@/core/api";
import { CollegeCourseList, CollegeCourseResponse, CollegeCourseCreate, CollegeCourseUpdate } from "@/features/college/types";

export const CollegeCoursesService = {
  // GET /api/v1/college/courses
  list() {
    return Api.get<CollegeCourseList[]>(`/college/courses`);
  },

  // GET /api/v1/college/courses/list
  listSlim() {
    return Api.get<CollegeCourseList[]>(`/college/courses/list`);
  },

  // POST /api/v1/college/courses
  create(payload: CollegeCourseCreate) {
    return Api.post<CollegeCourseResponse>(`/college/courses`, payload);
  },

  // GET /api/v1/college/courses/{course_id}
  getById(course_id: number) {
    return Api.get<CollegeCourseResponse>(`/college/courses/${course_id}`);
  },

  // PUT /api/v1/college/courses/{course_id}
  update(course_id: number, payload: CollegeCourseUpdate) {
    return Api.put<CollegeCourseResponse>(`/college/courses/${course_id}`, payload);
  },

  // DELETE /api/v1/college/courses/{course_id}
  delete(course_id: number) {
    return Api.delete<void>(`/college/courses/${course_id}`);
  },
};


