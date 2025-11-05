import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeCoursesService } from "@/lib/services/college/courses.service";
import type { CollegeCourseCreate, CollegeCourseList, CollegeCourseResponse, CollegeCourseUpdate } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useCollegeCourses() {
  return useQuery({
    queryKey: collegeKeys.courses.list(),
    queryFn: () => CollegeCoursesService.list() as Promise<CollegeCourseResponse[]>,
  });
}

export function useCollegeCoursesSlim() {
  return useQuery({
    queryKey: collegeKeys.courses.listSlim(),
    queryFn: () => CollegeCoursesService.listSlim(),
  });
}

export function useCreateCollegeCourse() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeCourseCreate) => CollegeCoursesService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.courses.root() });
    },
  }, "Course created successfully");
}

export function useUpdateCollegeCourse(courseId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeCourseUpdate) => CollegeCoursesService.update(courseId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.courses.detail(courseId) });
      qc.invalidateQueries({ queryKey: collegeKeys.courses.root() });
    },
  }, "Course updated successfully");
}

export function useDeleteCollegeCourse() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (courseId: number) => CollegeCoursesService.delete(courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.courses.root() });
    },
  }, "Course deleted successfully");
}


