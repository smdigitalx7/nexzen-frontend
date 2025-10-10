import { useQuery } from "@tanstack/react-query";
import { CollegeCoursesService } from "@/lib/services/college/courses.service";
import type { CollegeCourseList, CollegeCourseResponse } from "@/lib/types/college/index.ts";
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


