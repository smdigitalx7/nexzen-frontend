import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeGroupsService } from "@/lib/services/college/groups.service";
import type { CollegeGroupCreate, CollegeGroupList, CollegeGroupResponse, CollegeGroupUpdate, CollegeGroupSubjectRead } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useCollegeGroups() {
  return useQuery({
    queryKey: collegeKeys.groups.list(),
    queryFn: () => CollegeGroupsService.list() as Promise<CollegeGroupResponse[]>,
  });
}

export function useCollegeGroupsSlim() {
  return useQuery({
    queryKey: collegeKeys.groups.listSlim(),
    queryFn: () => CollegeGroupsService.listSlim(),
  });
}

export function useCreateCollegeGroup() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeGroupCreate) => CollegeGroupsService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.groups.root() });
    },
  }, "Group created successfully");
}

export function useUpdateCollegeGroup(groupId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeGroupUpdate) => CollegeGroupsService.update(groupId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.groups.detail(groupId) });
      void qc.invalidateQueries({ queryKey: collegeKeys.groups.root() });
    },
  }, "Group updated successfully");
}

export function useDeleteCollegeGroup() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (groupId: number) => CollegeGroupsService.delete(groupId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.groups.root() });
    },
  }, "Group deleted successfully");
}

export function useCollegeGroupSubjects(groupId: number | null | undefined) {
  return useQuery({
    queryKey: typeof groupId === "number" ? [...collegeKeys.groups.detail(groupId), "subjects"] : [...collegeKeys.groups.root(), "subjects", "nil"],
    queryFn: () => CollegeGroupsService.getSubjects(groupId as number),
    enabled: typeof groupId === "number" && groupId > 0,
  });
}


