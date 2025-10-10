import { Api } from "@/lib/api";

export const CollegeGroupsService = {
  // GET /api/v1/college/groups
  list() {
    return Api.get<unknown>(`/college/groups`);
  },

  // GET /api/v1/college/groups/list
  listSlim() {
    return Api.get<unknown>(`/college/groups/list`);
  },
};


