import { Api } from "@/core/api";
import {
  CollegeClassList,
  CollegeClassResponse,
  CollegeClassWithGroups,
  CollegeClassCreate,
  CollegeClassUpdate,
} from "@/features/college/types";

export const CollegeClassesService = {
  list() {
    return Api.get<CollegeClassResponse[]>(`/college/classes`);
  },

  listSlim() {
    return Api.get<CollegeClassList[]>(`/college/classes/list`);
  },

  // POST /api/v1/college/classes
  create(payload: CollegeClassCreate) {
    return Api.post<CollegeClassResponse>(`/college/classes`, payload);
  },

  // GET /api/v1/college/classes/{class_id}/groups
  getGroups(class_id: number) {
    return Api.get<CollegeClassWithGroups>(
      `/college/classes/${class_id}/groups`,
    );
  },

  // PUT /api/v1/college/classes/{class_id}
  update(class_id: number, payload: CollegeClassUpdate) {
    return Api.put<CollegeClassResponse>(
      `/college/classes/${class_id}`,
      payload,
    );
  },

  // DELETE /api/v1/college/classes/{class_id}
  delete(class_id: number) {
    return Api.delete<void>(`/college/classes/${class_id}`);
  },

  // DELETE /api/v1/college/classes/{class_id}/groups/{group_id}
  removeGroup(class_id: number, group_id: number) {
    return Api.delete<void>(
      `/college/classes/${class_id}/groups/${group_id}`,
    );
  },
};

