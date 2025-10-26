import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeTeacherCourseSubjectsService } from "@/lib/services/college/teacher-course-subjects.service";
import type { CollegeTeacherCourseSubjectCreate, CollegeTeacherCourseSubjectRead } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useTeacherCourseSubjectsList() {
  return useQuery({
    queryKey: collegeKeys.teacherCourseSubjects.list(),
    queryFn: () => CollegeTeacherCourseSubjectsService.list() as Promise<CollegeTeacherCourseSubjectRead[]>,
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
