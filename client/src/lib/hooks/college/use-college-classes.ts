import { useQuery } from "@tanstack/react-query";
import { CollegeClassesService } from "@/lib/services/college/classes.service";
import type { CollegeClassList, CollegeClassResponse } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";

export function useCollegeClasses() {
  return useQuery({
    queryKey: collegeKeys.classes.list(),
    queryFn: () => CollegeClassesService.list() as Promise<CollegeClassResponse[]>,
  });
}

export function useCollegeClassesSlim() {
  return useQuery({
    queryKey: collegeKeys.classes.listSlim(),
    queryFn: () => CollegeClassesService.listSlim() as Promise<CollegeClassList[]>,
  });
}


