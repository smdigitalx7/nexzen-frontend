import { Api } from "@/lib/api";
import type { 
  SchoolTeacherClassSubjectCreate, 
  SchoolTeacherClassSubjectRead,
  SchoolTeacherDetail 
} from "@/lib/types/school";

export const SchoolTeacherClassSubjectsService = {
  // Get hierarchical list (Teacher -> Classes -> Sections -> Subjects)
  // This is the default GET endpoint format from the backend
  getHierarchical() {
    return Api.get<SchoolTeacherDetail[]>(`/school/teacher-class-subjects`);
  },

  create(payload: SchoolTeacherClassSubjectCreate) {
    return Api.post<SchoolTeacherClassSubjectRead>(`/school/teacher-class-subjects`, payload);
  },

  delete(teacher_id: number, class_id: number, subject_id: number, section_id: number) {
    return Api.delete<void>(`/school/teacher-class-subjects/${teacher_id}/${class_id}/${subject_id}/${section_id}`);
  },
};
