import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeGroupsService } from "@/lib/services/college/groups.service";
import type { CollegeGroupCreate, CollegeGroupList, CollegeGroupResponse, CollegeGroupUpdate, CollegeGroupSubjectRead } from "@/lib/types/college/index.ts";
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

export function useCreateCollegeGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeGroupCreate) => CollegeGroupsService.create(payload) as Promise<CollegeGroupResponse>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.groups.root() });
    },
  });
}

export function useUpdateCollegeGroup(groupId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeGroupUpdate) => CollegeGroupsService.update(groupId, payload) as Promise<CollegeGroupResponse>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.groups.detail(groupId) });
      qc.invalidateQueries({ queryKey: collegeKeys.groups.root() });
    },
  });
}

export function useDeleteCollegeGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (groupId: number) => CollegeGroupsService.delete(groupId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.groups.root() });
    },
  });
}

export function useCollegeGroupSubjects(groupId: number | null | undefined) {
  return useQuery({
    queryKey: typeof groupId === "number" ? [...collegeKeys.groups.detail(groupId), "subjects"] : [...collegeKeys.groups.root(), "subjects", "nil"],
    queryFn: () => CollegeGroupsService.getSubjects(groupId as number) as Promise<CollegeGroupSubjectRead[]>,
    enabled: typeof groupId === "number" && groupId > 0,
  });
}


