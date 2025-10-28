import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeTeacherCourseSubjectsService, type CollegeTeacherCourseSubjectListParams } from "@/lib/services/college/teacher-course-subjects.service";
import type { CollegeTeacherCourseSubjectCreate, CollegeTeacherCourseSubjectRead, CollegeTeacherCourseSubjectGroupedRead } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useTeacherCourseSubjectsList(params?: CollegeTeacherCourseSubjectListParams) {
  return useQuery({
    queryKey: collegeKeys.teacherCourseSubjects.list(params),
    queryFn: () => CollegeTeacherCourseSubjectsService.list(params) as Promise<CollegeTeacherCourseSubjectGroupedRead[]>,
  });
}

export function useCreateTeacherCourseSubject() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeTeacherCourseSubjectCreate) => CollegeTeacherCourseSubjectsService.create(payload) as Promise<CollegeTeacherCourseSubjectRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.teacherCourseSubjects.root() });
    },
  }, "Teacher assignment created successfully");
}

export function useDeleteTeacherCourseSubject() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (teacherId: number) => CollegeTeacherCourseSubjectsService.deleteByTeacher(teacherId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.teacherCourseSubjects.root() });
    },
  }, "Teacher assignments removed successfully");
}

export function useDeleteTeacherCourseSubjectRelation() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: ({ teacherId, courseId, subjectId }: { teacherId: number; courseId: number; subjectId: number }) => 
      CollegeTeacherCourseSubjectsService.deleteRelation(teacherId, courseId, subjectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.teacherCourseSubjects.root() });
    },
  }, "Teacher assignment removed successfully");
}
