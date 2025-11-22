import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolTeacherClassSubjectsService } from "@/features/school/services/teacher-class-subjects.service";
import type { 
  SchoolTeacherClassSubjectCreate, 
  SchoolTeacherClassSubjectRead,
  SchoolTeacherDetail,
  ClassTeacherCreate,
  ClassTeacherDelete
} from "@/features/school/types";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";

export function useTeacherClassSubjectsHierarchical() {
  return useQuery({
    queryKey: schoolKeys.teacherClassSubjects.hierarchical(),
    queryFn: () => SchoolTeacherClassSubjectsService.getHierarchical(),
    staleTime: 30 * 1000, // 30 seconds - teacher assignments change more frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useClassTeachers() {
  return useQuery({
    queryKey: schoolKeys.teacherClassSubjects.classTeachers(),
    queryFn: () => SchoolTeacherClassSubjectsService.getClassTeachers(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateTeacherClassSubject() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolTeacherClassSubjectCreate) => SchoolTeacherClassSubjectsService.create(payload),
    onSuccess: () => {
      // Invalidate teacher assignment queries
      qc.invalidateQueries({ queryKey: schoolKeys.teacherClassSubjects.root() }).catch(console.error);
      // Invalidate cross-module caches that may show teacher info
      qc.invalidateQueries({ queryKey: schoolKeys.classes.root() }).catch(console.error);
      qc.invalidateQueries({ queryKey: schoolKeys.subjects.root() }).catch(console.error);
      // Refetch active queries
      qc.refetchQueries({ queryKey: schoolKeys.teacherClassSubjects.root(), type: 'active' }).catch(console.error);
      qc.refetchQueries({ queryKey: schoolKeys.classes.root(), type: 'active' }).catch(console.error);
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
      // Invalidate teacher assignment queries
      qc.invalidateQueries({ queryKey: schoolKeys.teacherClassSubjects.root() }).catch(console.error);
      // Invalidate cross-module caches that may show teacher info
      qc.invalidateQueries({ queryKey: schoolKeys.classes.root() }).catch(console.error);
      qc.invalidateQueries({ queryKey: schoolKeys.subjects.root() }).catch(console.error);
      // Refetch active queries
      qc.refetchQueries({ queryKey: schoolKeys.teacherClassSubjects.root(), type: 'active' }).catch(console.error);
      qc.refetchQueries({ queryKey: schoolKeys.classes.root(), type: 'active' }).catch(console.error);
    },
  }, "Teacher assignment removed successfully");
}

export function useCreateClassTeacher() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: ClassTeacherCreate) => SchoolTeacherClassSubjectsService.createClassTeacher(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.teacherClassSubjects.root() }).catch(console.error);
      qc.invalidateQueries({ queryKey: schoolKeys.classes.root() }).catch(console.error);
      qc.refetchQueries({ queryKey: schoolKeys.teacherClassSubjects.root(), type: 'active' }).catch(console.error);
      qc.refetchQueries({ queryKey: schoolKeys.classes.root(), type: 'active' }).catch(console.error);
    },
  }, "Class teacher assigned successfully");
}

export function useDeleteClassTeacher() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: ClassTeacherDelete) => SchoolTeacherClassSubjectsService.deleteClassTeacher(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.teacherClassSubjects.root() }).catch(console.error);
      qc.invalidateQueries({ queryKey: schoolKeys.classes.root() }).catch(console.error);
      qc.refetchQueries({ queryKey: schoolKeys.teacherClassSubjects.root(), type: 'active' }).catch(console.error);
      qc.refetchQueries({ queryKey: schoolKeys.classes.root(), type: 'active' }).catch(console.error);
    },
  }, "Class teacher removed successfully");
}
