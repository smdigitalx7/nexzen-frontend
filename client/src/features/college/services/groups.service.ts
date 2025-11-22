import { Api } from "@/core/api";
import { CollegeGroupList, CollegeGroupResponse, CollegeGroupCreate, CollegeGroupUpdate, CollegeGroupSubjectRead } from "@/features/college/types";

export const CollegeGroupsService = {
  // GET /api/v1/college/groups
  list() {
    return Api.get<CollegeGroupList[]>(`/college/groups`);
  },

  // GET /api/v1/college/groups/list
  listSlim() {
    return Api.get<CollegeGroupList[]>(`/college/groups/list`);
  },

  // POST /api/v1/college/groups
  create(payload: CollegeGroupCreate) {
    return Api.post<CollegeGroupResponse>(`/college/groups`, payload);
  },

  // GET /api/v1/college/groups/{group_id}
  getById(group_id: number) {
    return Api.get<CollegeGroupResponse>(`/college/groups/${group_id}`);
  },

  // PUT /api/v1/college/groups/{group_id}
  update(group_id: number, payload: CollegeGroupUpdate) {
    return Api.put<CollegeGroupResponse>(`/college/groups/${group_id}`, payload);
  },

  // DELETE /api/v1/college/groups/{group_id}
  delete(group_id: number) {
    return Api.delete<void>(`/college/groups/${group_id}`);
  },

  // GET /api/v1/college/groups/{group_id}/courses
  getCourses(group_id: number) {
    return Api.get<number[]>(`/college/groups/${group_id}/courses`);
  },

  // GET /api/v1/college/groups/{group_id}/subjects
  getSubjects(group_id: number) {
    return Api.get<CollegeGroupSubjectRead[]>(`/college/groups/${group_id}/subjects`);
  },

  // DELETE /api/v1/college/groups/{group_id}/subjects/{subject_id}
  deleteSubjectRelation(group_id: number, subject_id: number) {
    return Api.delete<void>(`/college/groups/${group_id}/subjects/${subject_id}`);
  },
};


