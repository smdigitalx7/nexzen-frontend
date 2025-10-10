import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeTestsService } from "@/lib/services/college/tests.service";
import type { CollegeTestCreate, CollegeTestRead, CollegeTestResponse, CollegeTestUpdate } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";

export function useCollegeTests() {
  return useQuery({
    queryKey: collegeKeys.tests.list(),
    queryFn: () => CollegeTestsService.list() as Promise<CollegeTestRead[]>,
  });
}

export function useCollegeTest(testId: number | null | undefined) {
  return useQuery({
    queryKey: typeof testId === "number" ? collegeKeys.tests.detail(testId) : [...collegeKeys.tests.root(), "detail", "nil"],
    queryFn: () => CollegeTestsService.getById(testId as number) as Promise<CollegeTestResponse>,
    enabled: typeof testId === "number" && testId > 0,
  });
}

export function useCreateCollegeTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeTestCreate) => CollegeTestsService.create(payload) as Promise<CollegeTestResponse>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.tests.root() });
    },
  });
}

export function useUpdateCollegeTest(testId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeTestUpdate) => CollegeTestsService.update(testId, payload) as Promise<CollegeTestResponse>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.tests.detail(testId) });
      qc.invalidateQueries({ queryKey: collegeKeys.tests.root() });
    },
  });
}

export function useDeleteCollegeTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (testId: number) => CollegeTestsService.delete(testId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.tests.root() });
    },
  });
}
