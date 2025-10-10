import { useQuery } from "@tanstack/react-query";
import { CollegeGroupsService } from "@/lib/services/college/groups.service";
import type { CollegeGroupList, CollegeGroupResponse } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";

export function useCollegeGroups() {
  return useQuery({
    queryKey: collegeKeys.groups.list(),
    queryFn: () => CollegeGroupsService.list() as Promise<CollegeGroupResponse[]>,
  });
}

export function useCollegeGroupsSlim() {
  return useQuery({
    queryKey: collegeKeys.groups.listSlim(),
    queryFn: () => CollegeGroupsService.listSlim() as Promise<CollegeGroupList[]>,
  });
}


