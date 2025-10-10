import { Api } from "@/lib/api";
import type { SchoolClassSubjectCreate, SchoolClassSubjectRead, SchoolClassSubjectUpdate } from "@/lib/types/school";

export const SchoolClassSubjectsService = {
  list() {
    return Api.get<SchoolClassSubjectRead[]>(`/school/class-subjects`);
  },

  create(payload: SchoolClassSubjectCreate) {
    return Api.post<SchoolClassSubjectRead>(`/school/class-subjects`, payload);
  },
};


