import { Api } from "@/lib/api";

export const CollegeCoursesService = {
  // GET /api/v1/college/courses
  list() {
    return Api.get<unknown>(`/college/courses`);
  },

  // GET /api/v1/college/courses/list
  listSlim() {
    return Api.get<unknown>(`/college/courses/list`);
  },
};


