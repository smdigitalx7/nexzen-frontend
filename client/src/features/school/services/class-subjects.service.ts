import { Api } from "@/core/api";
import type { SchoolClassSubjectCreate, SchoolClassSubjectRead, SchoolClassSubjectUpdate } from "@/features/school/types";

export const SchoolClassSubjectsService = {
  list() {
    return Api.get<SchoolClassSubjectRead[]>(`/school/class-subjects`);
  },

  create(payload: SchoolClassSubjectCreate) {
    return Api.post<SchoolClassSubjectRead>(`/school/class-subjects`, payload);
  },
};


