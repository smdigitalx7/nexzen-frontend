import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeTeacherGroupSubjectsService } from "@/lib/services/college/teacher-group-subjects.service";
import type { CollegeTeacherGroupSubjectCreate, CollegeTeacherGroupSubjectRead } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useTeacherGroupSubjectsList(params?: { class_id?: number; group_id?: number }) {
  return useQuery({
    queryKey: collegeKeys.teacherGroupSubjects.list(params),
    queryFn: () => CollegeTeacherGroupSubjectsService.list(params),
  });
}

export function useTeacherGroupSubjectsByTeacher(teacherId: number | null | undefined) {
  return useQuery({
    queryKey: typeof teacherId === "number" ? collegeKeys.teacherGroupSubjects.byTeacher(teacherId) : [...collegeKeys.teacherGroupSubjects.root(), "by-teacher", "nil"],
    queryFn: () => CollegeTeacherGroupSubjectsService.listByTeacher(teacherId as number),
    enabled: typeof teacherId === "number" && teacherId > 0,
  });
}

export function useCreateTeacherGroupSubject() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeTeacherGroupSubjectCreate) => CollegeTeacherGroupSubjectsService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.teacherGroupSubjects.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.teacherGroupSubjects.root(), type: 'active' });
    },
  }, "Teacher assignment created successfully");
}

export function useDeleteTeacherGroupSubjectsByTeacher() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (teacherId: number) => CollegeTeacherGroupSubjectsService.deleteByTeacher(teacherId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.teacherGroupSubjects.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.teacherGroupSubjects.root(), type: 'active' });
    },
  }, "Teacher assignments removed successfully");
}

export function useDeleteTeacherGroupSubjectRelation() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (input: { teacherId: number; groupId: number; subjectId: number }) =>
      CollegeTeacherGroupSubjectsService.deleteRelation(input.teacherId, input.groupId, input.subjectId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.teacherGroupSubjects.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.teacherGroupSubjects.root(), type: 'active' });
    },
  }, "Teacher assignment removed successfully");
}
