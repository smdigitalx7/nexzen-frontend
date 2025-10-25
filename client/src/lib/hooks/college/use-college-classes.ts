import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeClassesService } from "@/lib/services/college/classes.service";
import type {
  CollegeClassCreate,
  CollegeClassList,
  CollegeClassResponse,
  CollegeClassUpdate,
  CollegeClassWithGroups,
} from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";

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
      CollegeClassesService.listSlim() as Promise<CollegeClassList[]>,
  });
}

export function useCreateCollegeClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeClassCreate) =>
      CollegeClassesService.create(payload) as Promise<CollegeClassResponse>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.classes.root() });
    },
  });
}

export function useUpdateCollegeClass(classId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeClassUpdate) =>
      CollegeClassesService.update(
        classId,
        payload
      ) as Promise<CollegeClassResponse>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.classes.detail(classId) });
      qc.invalidateQueries({ queryKey: collegeKeys.classes.root() });
    },
  });
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
      ) as Promise<CollegeClassWithGroups>,
    enabled: typeof classId === "number" && classId > 0,
  });
}

export function useRemoveCollegeClassGroup(classId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (groupId: number) =>
      CollegeClassesService.removeGroup(classId, groupId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [...collegeKeys.classes.detail(classId), "groups"],
      });
    },
  });
}
