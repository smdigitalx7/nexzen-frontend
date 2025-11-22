import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeTestsService } from "@/features/college/services/tests.service";
import type { CollegeTestCreate, CollegeTestRead, CollegeTestResponse, CollegeTestUpdate } from "@/features/college/types/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";

export function useCollegeTests(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: collegeKeys.tests.list(),
    queryFn: async () => {
      try {
        return await CollegeTestsService.list();
      } catch (error: unknown) {
        // Handle 404 errors by returning empty array
        if (import.meta.env.DEV) {
          console.log('Tests API error:', error);
        }
        const errorObj = error as { message?: string; status?: number };
        if (errorObj?.message?.includes('404') || 
            errorObj?.message?.includes('Tests not found') ||
            errorObj?.message?.includes('Not Found') ||
            errorObj?.status === 404 ||
            errorObj?.message === 'Tests not found') {
          return [];
        }
        throw error;
      }
    },
    enabled: options?.enabled !== false, // Default to true, but allow disabling
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
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
      void qc.invalidateQueries({ queryKey: collegeKeys.tests.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.tests.root(), type: 'active' });
    },
  }, "Test created successfully");
}

export function useUpdateCollegeTest(testId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeTestUpdate) => CollegeTestsService.update(testId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.tests.detail(testId) });
      void qc.invalidateQueries({ queryKey: collegeKeys.tests.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.tests.root(), type: 'active' });
    },
  }, "Test updated successfully");
}

export function useDeleteCollegeTest() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (testId: number) => CollegeTestsService.delete(testId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.tests.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.tests.root(), type: 'active' });
    },
  }, "Test deleted successfully");
}
