import { Api } from "@/lib/api";

export const CollegeClassesService = {
  list() {
    return Api.get<unknown>(`/college/classes`);
  },

  listSlim() {
    return Api.get<unknown>(`/college/classes/list`);
  },
};


