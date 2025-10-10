import { Api } from "@/lib/api";

export const CollegeSubjectsService = {
  // GET /api/v1/college/subjects
  list() {
    return Api.get<unknown>(`/college/subjects`);
  },

  // GET /api/v1/college/subjects/list
  listSlim() {
    return Api.get<unknown>(`/college/subjects/list`);
  },
};


