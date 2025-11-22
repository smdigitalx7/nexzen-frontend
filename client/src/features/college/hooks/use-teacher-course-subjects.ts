import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeTeacherCourseSubjectsService, type CollegeTeacherCourseSubjectListParams } from "@/features/college/services/teacher-course-subjects.service";
import type { CollegeTeacherCourseSubjectCreate, CollegeTeacherCourseSubjectRead, CollegeTeacherCourseSubjectGroupedRead } from "@/features/college/types/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";

export function useTeacherCourseSubjectsList(params?: CollegeTeacherCourseSubjectListParams) {
  return useQuery({
    queryKey: collegeKeys.teacherCourseSubjects.list(params),
    queryFn: () => CollegeTeacherCourseSubjectsService.list(params),
  });
}

export function useCreateTeacherCourseSubject() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeTeacherCourseSubjectCreate) => CollegeTeacherCourseSubjectsService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.teacherCourseSubjects.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.teacherCourseSubjects.root(), type: 'active' });
    },
  }, "Teacher assignment created successfully");
}

export function useDeleteTeacherCourseSubject() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (teacherId: number) => CollegeTeacherCourseSubjectsService.deleteByTeacher(teacherId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.teacherCourseSubjects.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.teacherCourseSubjects.root(), type: 'active' });
    },
  }, "Teacher assignments removed successfully");
}

export function useDeleteTeacherCourseSubjectRelation() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: ({ teacherId, courseId, subjectId }: { teacherId: number; courseId: number; subjectId: number }) => 
      CollegeTeacherCourseSubjectsService.deleteRelation(teacherId, courseId, subjectId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.teacherCourseSubjects.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.teacherCourseSubjects.root(), type: 'active' });
    },
  }, "Teacher assignment removed successfully");
}
