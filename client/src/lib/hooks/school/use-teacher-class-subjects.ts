import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolTeacherClassSubjectsService } from "@/lib/services/school/teacher-class-subjects.service";
import type { 
  SchoolTeacherClassSubjectCreate, 
  SchoolTeacherClassSubjectRead,
  SchoolTeacherDetail,
  ClassTeacherCreate,
  ClassTeacherDelete
} from "@/lib/types/school";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useTeacherClassSubjectsHierarchical() {
  return useQuery({
    queryKey: schoolKeys.teacherClassSubjects.hierarchical(),
    queryFn: () => SchoolTeacherClassSubjectsService.getHierarchical(),
  });
}

export function useClassTeachers() {
  return useQuery({
    queryKey: schoolKeys.teacherClassSubjects.classTeachers(),
    queryFn: () => SchoolTeacherClassSubjectsService.getClassTeachers(),
  });
}

export function useCreateTeacherClassSubject() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolTeacherClassSubjectCreate) => SchoolTeacherClassSubjectsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.teacherClassSubjects.root() });
    },
  }, "Teacher assignment created successfully");
}

export function useDeleteTeacherClassSubject() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: ({ teacherId, classId, subjectId, sectionId }: { teacherId: number; classId: number; subjectId: number; sectionId: number }) => {
      return SchoolTeacherClassSubjectsService.delete(teacherId, classId, subjectId, sectionId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.teacherClassSubjects.root() });
    },
  }, "Teacher assignment removed successfully");
}

export function useCreateClassTeacher() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: ClassTeacherCreate) => SchoolTeacherClassSubjectsService.createClassTeacher(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.teacherClassSubjects.root() });
    },
  }, "Class teacher assigned successfully");
}

export function useDeleteClassTeacher() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: ClassTeacherDelete) => SchoolTeacherClassSubjectsService.deleteClassTeacher(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.teacherClassSubjects.root() });
    },
  }, "Class teacher removed successfully");
}
