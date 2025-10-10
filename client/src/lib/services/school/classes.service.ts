import { Api } from "@/lib/api";
import type { SchoolClassCreate, SchoolClassRead, SchoolClassUpdate, SchoolClassWithSubjects } from "@/lib/types/school";

export const SchoolClassesService = {
  list() {
    return Api.get<SchoolClassRead[]>(`/school/classes`);
  },

  getById(class_id: number) {
    return Api.get<SchoolClassRead>(`/school/classes/${class_id}`);
  },

  create(payload: SchoolClassCreate) {
    return Api.post<SchoolClassRead>(`/school/classes`, payload);
  },

  update(class_id: number, payload: SchoolClassUpdate) {
    return Api.put<SchoolClassRead>(`/school/classes/${class_id}`, payload);
  },

  getSubjects(class_id: number) {
    return Api.get<SchoolClassWithSubjects>(`/school/classes/${class_id}/subjects`);
  },

  deleteClassSubject(class_id: number, subject_id: number) {
    return Api.delete<void>(`/school/classes/${class_id}/subject/${subject_id}`);
  },
};
