import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeCoursesService } from "@/lib/services/college/courses.service";
import type { CollegeCourseCreate, CollegeCourseList, CollegeCourseResponse, CollegeCourseUpdate } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";

export function useCollegeCourses() {
  return useQuery({
    queryKey: collegeKeys.courses.list(),
    queryFn: () => CollegeCoursesService.list() as Promise<CollegeCourseResponse[]>,
  });
}

export function useCollegeCoursesSlim() {
  return useQuery({
    queryKey: collegeKeys.courses.listSlim(),
    queryFn: () => CollegeCoursesService.listSlim() as Promise<CollegeCourseList[]>,
  });
}

export function useCreateCollegeCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeCourseCreate) => CollegeCoursesService.create(payload) as Promise<CollegeCourseResponse>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.courses.root() });
    },
  });
}

export function useUpdateCollegeCourse(courseId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeCourseUpdate) => CollegeCoursesService.update(courseId, payload) as Promise<CollegeCourseResponse>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.courses.detail(courseId) });
      qc.invalidateQueries({ queryKey: collegeKeys.courses.root() });
    },
  });
}

export function useDeleteCollegeCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId: number) => CollegeCoursesService.delete(courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.courses.root() });
    },
  });
}


