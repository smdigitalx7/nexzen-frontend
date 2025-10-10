import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeTeacherGroupSubjectsService } from "@/lib/services/college/teacher-group-subjects.service";
import { collegeKeys } from "./query-keys";

export function useTeacherGroupSubjectsList(params?: { class_id?: number; group_id?: number }) {
  return useQuery({
    queryKey: collegeKeys.teacherGroupSubjects.list(params as Record<string, unknown> | undefined),
    queryFn: () => CollegeTeacherGroupSubjectsService.list(params) as Promise<any[]>,
  });
}

export function useTeacherGroupSubjectsByTeacher(teacherId: number | null | undefined) {
  return useQuery({
    queryKey: typeof teacherId === "number" ? collegeKeys.teacherGroupSubjects.byTeacher(teacherId) : [...collegeKeys.teacherGroupSubjects.root(), "by-teacher", "nil"],
    queryFn: () => CollegeTeacherGroupSubjectsService.listByTeacher(teacherId as number) as Promise<any[]>,
    enabled: typeof teacherId === "number" && teacherId > 0,
  });
}

export function useCreateTeacherGroupSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => CollegeTeacherGroupSubjectsService.create(payload) as Promise<any>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.teacherGroupSubjects.root() });
    },
  });
}

export function useDeleteTeacherGroupSubjectsByTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (teacherId: number) => CollegeTeacherGroupSubjectsService.deleteByTeacher(teacherId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.teacherGroupSubjects.root() });
    },
  });
}

export function useDeleteTeacherGroupSubjectRelation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { teacherId: number; groupId: number; subjectId: number }) =>
      CollegeTeacherGroupSubjectsService.deleteRelation(input.teacherId, input.groupId, input.subjectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.teacherGroupSubjects.root() });
    },
  });
}


