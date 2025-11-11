import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeTestMarksService } from "@/lib/services/college/test-marks.service";
import type { CollegeCreateTestMarkBulk, CollegeTestMarkBulkCreateResult, CollegeTestMarkCreate, CollegeTestMarkFullReadResponse, CollegeTestMarkMinimalRead, CollegeTestMarkUpdate, CollegeTestMarksListParams, CollegeCreateTestMarksMultipleSubjects, CollegeTestMarksMultipleSubjectsResult } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useCollegeTestMarksList(params?: CollegeTestMarksListParams) {
  return useQuery({
    queryKey: collegeKeys.testMarks.list(params),
    queryFn: () => CollegeTestMarksService.list(params!),
    enabled: 
      !!params && 
      typeof params.class_id === "number" && 
      params.class_id > 0 &&
      typeof params.group_id === "number" && 
      params.group_id > 0 &&
      typeof params.test_id === "number" && 
      params.test_id > 0 &&
      typeof params.subject_id === "number" && 
      params.subject_id > 0,
  });
}

export function useCollegeTestMark(markId: number | null | undefined) {
  return useQuery({
    queryKey: typeof markId === "number" ? collegeKeys.testMarks.detail(markId) : [...collegeKeys.testMarks.root(), "detail", "nil"],
    queryFn: async () => {
      try {
        return await CollegeTestMarksService.getById(markId as number);
      } catch (error: unknown) {
        // Extract error message - Api class attaches status and data to Error
        let errorMessage = "Failed to load test mark details";
        
        if (error instanceof Error) {
          const apiError = error as Error & { status?: number; data?: { detail?: string; message?: string } };
          
          if (apiError.status === 422) {
            errorMessage = apiError.data?.detail || apiError.data?.message || apiError.message || "Invalid test mark data. The backend response may be missing required fields (admission_no, class_name).";
          } else if (apiError.status === 404) {
            errorMessage = "Test mark not found";
          } else {
            errorMessage = apiError.data?.detail || apiError.data?.message || apiError.message || errorMessage;
          }
        } else if (error && typeof error === 'object' && 'message' in error) {
          errorMessage = String(error.message);
        }
        
        throw new Error(errorMessage);
      }
    },
    enabled: typeof markId === "number" && markId > 0,
    retry: false, // Don't retry on errors
  });
}

export function useCreateCollegeTestMark() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeTestMarkCreate) => CollegeTestMarksService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.testMarks.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.testMarks.root(), type: 'active' });
    },
  }, "Test mark created successfully");
}

export function useUpdateCollegeTestMark(markId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeTestMarkUpdate) => CollegeTestMarksService.update(markId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.testMarks.detail(markId) });
      void qc.invalidateQueries({ queryKey: collegeKeys.testMarks.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.testMarks.root(), type: 'active' });
    },
  }, "Test mark updated successfully");
}

export function useDeleteCollegeTestMark() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (markId: number) => CollegeTestMarksService.delete(markId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.testMarks.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.testMarks.root(), type: 'active' });
    },
  }, "Test mark deleted successfully");
}

export function useBulkCreateCollegeTestMarks() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeCreateTestMarkBulk) =>
      CollegeTestMarksService.bulkCreate(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.testMarks.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.testMarks.root(), type: 'active' });
    },
  }, "Test marks created successfully");
}

export function useCreateCollegeTestMarksMultipleSubjects() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeCreateTestMarksMultipleSubjects) => CollegeTestMarksService.createMultipleSubjects(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.testMarks.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.testMarks.root(), type: 'active' });
    },
  }, "Test marks created successfully");
}
