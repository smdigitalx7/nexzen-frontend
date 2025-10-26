import { Api } from "@/lib/api";
import type { SchoolSectionCreate, SchoolSectionRead, SchoolSectionUpdate } from "@/lib/types/school";

export const SchoolSectionsService = {
  listByClass(class_id: number) {
    return Api.get<SchoolSectionRead[]>(`/school/classes/${class_id}/sections`);
  },

  getById(class_id: number, section_id: number) {
    return Api.get<SchoolSectionRead>(`/school/classes/${class_id}/sections/${section_id}`);
  },

  create(class_id: number, payload: SchoolSectionCreate) {
    return Api.post<SchoolSectionRead>(`/school/classes/${class_id}/sections`, payload);
  },

  update(class_id: number, section_id: number, payload: SchoolSectionUpdate) {
    return Api.put<SchoolSectionRead>(`/school/classes/${class_id}/sections/${section_id}`, payload);
  },

  delete(class_id: number, section_id: number) {
    return Api.delete<{ message: string }>(`/school/classes/${class_id}/sections/${section_id}`);
  },
};


