import { Api } from "@/core/api";
import { CollegeSubjectList, CollegeSubjectResponse, CollegeCreateSubject, CollegeUpdateSubject, CollegeGroupSubjectCreate, CollegeGroupSubjectRead, CollegeGroupSubjectUpdate } from "@/features/college/types";

export const CollegeSubjectsService = {
  // GET /api/v1/college/subjects
  list() {
    return Api.get<CollegeSubjectList[]>(`/college/subjects`);
  },

  // GET /api/v1/college/subjects/list
  listSlim() {
    return Api.get<CollegeSubjectList[]>(`/college/subjects/list`);
  },

  // POST /api/v1/college/subjects
  create(payload: CollegeCreateSubject) {
    return Api.post<CollegeSubjectResponse>(`/college/subjects`, payload);
  },

  // GET /api/v1/college/subjects/{subject_id}
  getById(subject_id: number) {
    return Api.get<CollegeSubjectResponse>(`/college/subjects/${subject_id}`);
  },

  // PUT /api/v1/college/subjects/{subject_id}
  update(subject_id: number, payload: CollegeUpdateSubject) {
    return Api.put<CollegeSubjectResponse>(`/college/subjects/${subject_id}`, payload);
  },

  // DELETE /api/v1/college/subjects/{subject_id}
  delete(subject_id: number) {
    return Api.delete<void>(`/college/subjects/${subject_id}`);
  },

  // POST /api/v1/college/subjects/{subject_id}/groups
  addToGroup(subject_id: number, payload: CollegeGroupSubjectCreate) {
    return Api.post<CollegeGroupSubjectRead>(`/college/subjects/${subject_id}/groups`, payload);
  },

  // PUT /api/v1/college/subjects/{subject_id}/groups/{group_id}
  updateGroupRelation(subject_id: number, group_id: number, payload: CollegeGroupSubjectUpdate) {
    return Api.put<CollegeGroupSubjectRead>(`/college/subjects/${subject_id}/groups/${group_id}` , payload);
  },
};


