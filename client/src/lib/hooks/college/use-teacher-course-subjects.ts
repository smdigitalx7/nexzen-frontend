import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeTeacherCourseSubjectsService } from "@/lib/services/college/teacher-course-subjects.service";
import type { CollegeTeacherCourseSubjectCreate, CollegeTeacherCourseSubjectRead } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";

export function useTeacherCourseSubjectsList() {
  return useQuery({
    queryKey: collegeKeys.teacherCourseSubjects.list(),
    queryFn: () => CollegeTeacherCourseSubjectsService.list() as Promise<CollegeTeacherCourseSubjectRead[]>,
  });
}

export function useCreateTeacherCourseSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeTeacherCourseSubjectCreate) => CollegeTeacherCourseSubjectsService.create(payload) as Promise<CollegeTeacherCourseSubjectRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.teacherCourseSubjects.root() });
    },
  });
}

export function useDeleteTeacherCourseSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (teacherId: number) => CollegeTeacherCourseSubjectsService.deleteByTeacher(teacherId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.teacherCourseSubjects.root() });
    },
  });
}
