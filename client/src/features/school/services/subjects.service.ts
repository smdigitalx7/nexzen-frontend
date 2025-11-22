import { Api } from "@/core/api";
import type { SchoolSubjectCreate, SchoolSubjectRead, SchoolSubjectUpdate, SchoolClassRead } from "@/features/school/types";

export const SchoolSubjectsService = {
  list() {
    return Api.get<SchoolSubjectRead[]>(`/school/subjects`);
  },

  getById(subject_id: number) {
    return Api.get<SchoolSubjectRead>(`/school/subjects/${subject_id}`);
  },

  create(payload: SchoolSubjectCreate) {
    return Api.post<SchoolSubjectRead>(`/school/subjects`, payload);
  },

  update(subject_id: number, payload: SchoolSubjectUpdate) {
    return Api.put<SchoolSubjectRead>(`/school/subjects/${subject_id}`, payload);
  },

  delete(subject_id: number) {
    return Api.delete<void>(`/school/subjects/${subject_id}`);
  },

  getClasses(subject_id: number) {
    return Api.get<SchoolClassRead[]>(`/school/subjects/${subject_id}/classes`);
  },

  removeClassFromSubject(subject_id: number, class_id: number) {
    return Api.delete<void>(`/school/subjects/${subject_id}/classes/${class_id}`);
  },
};


