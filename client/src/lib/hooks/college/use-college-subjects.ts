import { useQuery } from "@tanstack/react-query";
import { CollegeSubjectsService } from "@/lib/services/college/subjects.service";
import type { CollegeSubjectList, CollegeSubjectResponse } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";

export function useCollegeSubjects() {
  return useQuery({
    queryKey: collegeKeys.subjects.list(),
    queryFn: () => CollegeSubjectsService.list() as Promise<CollegeSubjectResponse[]>,
  });
}

export function useCollegeSubjectsSlim() {
  return useQuery({
    queryKey: collegeKeys.subjects.listSlim(),
    queryFn: () => CollegeSubjectsService.listSlim() as Promise<CollegeSubjectList[]>,
  });
}


