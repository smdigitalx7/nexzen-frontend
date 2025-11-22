import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeGroupsService } from "@/features/college/services/groups.service";
import type { CollegeGroupCreate, CollegeGroupList, CollegeGroupResponse, CollegeGroupUpdate, CollegeGroupSubjectRead } from "@/features/college/types/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";

export function useCollegeGroups(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: collegeKeys.groups.list(),
    queryFn: async () => {
      try {
        return await CollegeGroupsService.list();
      } catch (error: unknown) {
        // Handle 404 errors by returning empty array
        if (import.meta.env.DEV) {
          console.log("Groups API error:", error);
        }
        // Api class attaches status property to Error objects
        if (error instanceof Error) {
          const apiError = error as Error & { status?: number; data?: { detail?: string } };
          if (apiError.status === 404) {
            return [];
          }
        }
        // Fallback check for other error formats
        const errorObj = error as { message?: string; status?: number };
        if (
          errorObj?.status === 404 ||
          errorObj?.message?.includes("404") ||
          errorObj?.message?.includes("Groups not found") ||
          errorObj?.message?.includes("Not Found")
        ) {
          return [];
        }
        throw error;
      }
    },
    enabled: options?.enabled === true, // ✅ OPTIMIZATION: Only fetch when explicitly enabled (on-demand)
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: false, // ✅ OPTIMIZATION: No auto-refetch on mount - fetch on demand only
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
      void qc.refetchQueries({ queryKey: collegeKeys.groups.root(), type: 'active' });
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
      void qc.refetchQueries({ queryKey: collegeKeys.groups.root(), type: 'active' });
    },
  }, "Group updated successfully");
}

export function useDeleteCollegeGroup() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (groupId: number) => CollegeGroupsService.delete(groupId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.groups.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.groups.root(), type: 'active' });
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


