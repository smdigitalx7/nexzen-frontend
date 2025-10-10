import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeTeacherCourseSubjectsService } from "@/lib/services/college/teacher-course-subjects.service";
import { collegeKeys } from "./query-keys";

export function useTeacherCourseSubjectsList() {
  return useQuery({
    queryKey: collegeKeys.teacherCourseSubjects.list(),
    queryFn: () => CollegeTeacherCourseSubjectsService.list() as Promise<any[]>,
  });
}

export function useCreateTeacherCourseSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => CollegeTeacherCourseSubjectsService.create(payload) as Promise<any>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.teacherCourseSubjects.root() });
    },
  });
}

export function useDeleteTeacherCourseSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => CollegeTeacherCourseSubjectsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.teacherCourseSubjects.root() });
    },
  });
}


