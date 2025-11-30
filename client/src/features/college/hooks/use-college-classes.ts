import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeClassesService } from "@/features/college/services/classes.service";
import type {
  CollegeClassCreate,
  CollegeClassList,
  CollegeClassResponse,
  CollegeClassUpdate,
  CollegeClassWithGroups,
} from "@/features/college/types/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";

export function useCollegeClasses(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: collegeKeys.classes.list(),
    queryFn: async () => {
      try {
        return await CollegeClassesService.list();
      } catch (error: unknown) {
        // Handle 404 errors by returning empty array
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
          errorObj?.message?.includes("Classes not found") ||
          errorObj?.message?.includes("Not Found")
        ) {
          return [];
        }
        throw error;
      }
    },
    enabled: options?.enabled !== false,
  });
}

export function useCollegeClassesSlim() {
  return useQuery({
    queryKey: collegeKeys.classes.listSlim(),
    queryFn: () =>
      CollegeClassesService.listSlim(),
  });
}

export function useCreateCollegeClass() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeClassCreate) =>
      CollegeClassesService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.classes.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.classes.root(), type: 'active' });
    },
  }, "Class created successfully");
}

export function useUpdateCollegeClass(classId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeClassUpdate) =>
      CollegeClassesService.update(
        classId,
        payload
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.classes.detail(classId) });
      void qc.invalidateQueries({ queryKey: collegeKeys.classes.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.classes.root(), type: 'active' });
    },
  }, "Class updated successfully");
}

export function useCollegeClassGroups(classId: number | null | undefined) {
  return useQuery({
    queryKey:
      typeof classId === "number"
        ? [...collegeKeys.classes.detail(classId), "groups"]
        : [...collegeKeys.classes.root(), "groups", "nil"],
    queryFn: () =>
      CollegeClassesService.getGroups(
        classId as number
      ),
    enabled: typeof classId === "number" && classId > 0,
    staleTime: 30 * 1000, // 30 seconds - groups change more frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: true, // Only refetch on mount if data is stale
  });
}

export function useRemoveCollegeClassGroup(classId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (groupId: number) =>
      CollegeClassesService.removeGroup(classId, groupId),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: [...collegeKeys.classes.detail(classId), "groups"],
      });
      void qc.refetchQueries({
        queryKey: [...collegeKeys.classes.detail(classId), "groups"],
        type: 'active'
      });
      void qc.refetchQueries({ queryKey: collegeKeys.classes.root(), type: 'active' });
    },
  }, "Group removed from class successfully");
}
