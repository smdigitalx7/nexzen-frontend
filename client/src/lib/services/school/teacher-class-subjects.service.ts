import { Api } from "@/lib/api";
import type { SchoolTeacherClassSubjectCreate, SchoolTeacherClassSubjectRead } from "@/lib/types/school";

export const SchoolTeacherClassSubjectsService = {
  list() {
    return Api.get<SchoolTeacherClassSubjectRead[]>(`/school/teacher-class-subjects`);
  },

  create(payload: SchoolTeacherClassSubjectCreate) {
    return Api.post<SchoolTeacherClassSubjectRead>(`/school/teacher-class-subjects`, payload);
  },

  delete(teacher_id: number, class_id: number, subject_id: number) {
    return Api.delete<void>(`/school/teacher-class-subjects/${teacher_id}/${class_id}/${subject_id}`);
  },
};
