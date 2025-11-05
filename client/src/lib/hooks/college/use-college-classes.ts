import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeClassesService } from "@/lib/services/college/classes.service";
import type {
  CollegeClassCreate,
  CollegeClassList,
  CollegeClassResponse,
  CollegeClassUpdate,
  CollegeClassWithGroups,
} from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useCollegeClasses(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: collegeKeys.classes.list(),
    queryFn: () =>
      CollegeClassesService.list() as Promise<CollegeClassResponse[]>,
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
    },
  }, "Group removed from class successfully");
}
