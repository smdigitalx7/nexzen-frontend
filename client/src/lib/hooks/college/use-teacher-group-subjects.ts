import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeTeacherGroupSubjectsService } from "@/lib/services/college/teacher-group-subjects.service";
import type { CollegeTeacherGroupSubjectCreate, CollegeTeacherGroupSubjectRead } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useTeacherGroupSubjectsList(params?: { class_id?: number; group_id?: number }) {
  return useQuery({
    queryKey: collegeKeys.teacherGroupSubjects.list(params),
    queryFn: () => CollegeTeacherGroupSubjectsService.list(params) as Promise<CollegeTeacherGroupSubjectRead[]>,
  });
}

export function useTeacherGroupSubjectsByTeacher(teacherId: number | null | undefined) {
  return useQuery({
    queryKey: typeof teacherId === "number" ? collegeKeys.teacherGroupSubjects.byTeacher(teacherId) : [...collegeKeys.teacherGroupSubjects.root(), "by-teacher", "nil"],
    queryFn: () => CollegeTeacherGroupSubjectsService.listByTeacher(teacherId as number) as Promise<CollegeTeacherGroupSubjectRead[]>,
    enabled: typeof teacherId === "number" && teacherId > 0,
  });
}

export function useCreateTeacherGroupSubject() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeTeacherGroupSubjectCreate) => CollegeTeacherGroupSubjectsService.create(payload) as Promise<CollegeTeacherGroupSubjectRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.teacherGroupSubjects.root() });
    },
  }, "Teacher assignment created successfully");
}

export function useDeleteTeacherGroupSubjectsByTeacher() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (teacherId: number) => CollegeTeacherGroupSubjectsService.deleteByTeacher(teacherId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.teacherGroupSubjects.root() });
    },
  }, "Teacher assignments removed successfully");
}

export function useDeleteTeacherGroupSubjectRelation() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (input: { teacherId: number; groupId: number; subjectId: number }) =>
      CollegeTeacherGroupSubjectsService.deleteRelation(input.teacherId, input.groupId, input.subjectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.teacherGroupSubjects.root() });
    },
  }, "Teacher assignment removed successfully");
}
