import { Api } from "@/lib/api";
import type { 
  SchoolTeacherClassSubjectCreate, 
  SchoolTeacherClassSubjectRead,
  SchoolTeacherDetail,
  ClassTeacherCreate,
  ClassTeacherDelete
} from "@/lib/types/school";

export const SchoolTeacherClassSubjectsService = {
  // Get hierarchical list (Teacher -> Classes -> Sections -> Subjects)
  // This is the default GET endpoint format from the backend
  getHierarchical() {
    return Api.get<SchoolTeacherDetail[]>(`/school/teacher-class-subjects`);
  },

  // Get class teachers only (flattened list of class teacher assignments)
  getClassTeachers() {
    return Api.get<SchoolTeacherClassSubjectRead[]>(`/school/teacher-class-subjects/class-teachers`);
  },

  create(payload: SchoolTeacherClassSubjectCreate) {
    return Api.post<SchoolTeacherClassSubjectRead>(`/school/teacher-class-subjects`, payload);
  },

  // Create class teacher assignment (doesn't require subject_id)
  createClassTeacher(payload: ClassTeacherCreate) {
    return Api.post<SchoolTeacherClassSubjectRead>(`/school/teacher-class-subjects/class-teacher`, payload);
  },

  delete(teacher_id: number, class_id: number, subject_id: number, section_id: number) {
    return Api.delete<void>(`/school/teacher-class-subjects/${teacher_id}/${class_id}/${subject_id}/${section_id}`);
  },

  // Delete class teacher assignment
  deleteClassTeacher(payload: ClassTeacherDelete) {
    return Api.delete<void>(`/school/teacher-class-subjects/class-teacher`, undefined, undefined, { body: payload });
  },
};
