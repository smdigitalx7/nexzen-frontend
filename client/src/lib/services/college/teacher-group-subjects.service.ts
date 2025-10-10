import { Api } from "@/lib/api";
import { CollegeTeacherGroupSubjectCreate, CollegeTeacherGroupSubjectRead } from "@/lib/types/college";

export interface TeacherGroupSubjectsListParams {
  class_id?: number;
  group_id?: number;
}

export const CollegeTeacherGroupSubjectsService = {
  // GET /api/v1/college/teacher-group-subjects
  list(params?: TeacherGroupSubjectsListParams) {
    return Api.get<CollegeTeacherGroupSubjectRead[]>(`/college/teacher-group-subjects`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  // GET /api/v1/college/teacher-group-subjects/teacher/{teacher_id}
  listByTeacher(teacher_id: number) {
    return Api.get<CollegeTeacherGroupSubjectRead[]>(`/college/teacher-group-subjects/teacher/${teacher_id}`);
  },

  // POST /api/v1/college/teacher-group-subjects
  create(payload: CollegeTeacherGroupSubjectCreate) {
    return Api.post<CollegeTeacherGroupSubjectRead>(`/college/teacher-group-subjects`, payload);
  },

  // DELETE /api/v1/college/teacher-group-subjects/teacher/{teacher_id}
  deleteByTeacher(teacher_id: number) {
    return Api.delete<void>(`/college/teacher-group-subjects/teacher/${teacher_id}`);
  },

  // DELETE /api/v1/college/teacher-group-subjects/teacher/{teacher_id}/groups/{group_id}/subjects/{subject_id}
  deleteRelation(teacher_id: number, group_id: number, subject_id: number) {
    return Api.delete<void>(`/college/teacher-group-subjects/teacher/${teacher_id}/groups/${group_id}/subjects/${subject_id}`);
  },
};


