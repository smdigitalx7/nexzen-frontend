import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeTestsService } from "@/lib/services/college/tests.service";
import type { CollegeTestCreate, CollegeTestRead, CollegeTestResponse, CollegeTestUpdate } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useCollegeTests() {
  return useQuery({
    queryKey: collegeKeys.tests.list(),
    queryFn: async () => {
      try {
        return await CollegeTestsService.list();
      } catch (error: any) {
        // Handle 404 errors by returning empty array
        console.log('Tests API error:', error);
        if (error?.message?.includes('404') || 
            error?.message?.includes('Tests not found') ||
            error?.message?.includes('Not Found') ||
            error?.status === 404 ||
            error?.message === 'Tests not found') {
          return [];
        }
        throw error;
      }
    },
  });
}

export function useCollegeTest(testId: number | null | undefined) {
  return useQuery({
    queryKey: typeof testId === "number" ? collegeKeys.tests.detail(testId) : [...collegeKeys.tests.root(), "detail", "nil"],
    queryFn: () => CollegeTestsService.getById(testId as number),
    enabled: typeof testId === "number" && testId > 0,
  });
}

export function useCreateCollegeTest() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeTestCreate) => CollegeTestsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.tests.root() });
    },
  }, "Test created successfully");
}

export function useUpdateCollegeTest(testId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeTestUpdate) => CollegeTestsService.update(testId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.tests.detail(testId) });
      qc.invalidateQueries({ queryKey: collegeKeys.tests.root() });
    },
  }, "Test updated successfully");
}

export function useDeleteCollegeTest() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (testId: number) => CollegeTestsService.delete(testId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.tests.root() });
    },
  }, "Test deleted successfully");
}
