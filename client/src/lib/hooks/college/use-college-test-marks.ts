import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeTestMarksService } from "@/lib/services/college/test-marks.service";
import type { CollegeCreateTestMarkBulk, CollegeTestMarkBulkCreateResult, CollegeTestMarkFullReadResponse, CollegeTestMarkMinimalRead, CollegeTestMarkUpdate, CollegeTestMarksListParams } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useCollegeTestMarksList(params?: CollegeTestMarksListParams) {
  return useQuery({
    queryKey: collegeKeys.testMarks.list(params),
    queryFn: () => CollegeTestMarksService.list(params) as Promise<CollegeTestMarkMinimalRead[]>,
    enabled: !!params && !!params.class_id && !!params.group_id,
  });
}

export function useCollegeTestMark(markId: number | null | undefined) {
  return useQuery({
    queryKey: typeof markId === "number" ? collegeKeys.testMarks.detail(markId) : [...collegeKeys.testMarks.root(), "detail", "nil"],
    queryFn: () => CollegeTestMarksService.getById(markId as number) as Promise<CollegeTestMarkFullReadResponse>,
    enabled: typeof markId === "number" && markId > 0,
  });
}

export function useCreateCollegeTestMark() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeTestMarkUpdate) => CollegeTestMarksService.create(payload) as Promise<CollegeTestMarkFullReadResponse>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.testMarks.root() });
    },
  }, "Test mark created successfully");
}

export function useUpdateCollegeTestMark(markId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeTestMarkUpdate) => CollegeTestMarksService.update(markId, payload) as Promise<CollegeTestMarkFullReadResponse>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.testMarks.detail(markId) });
      qc.invalidateQueries({ queryKey: collegeKeys.testMarks.root() });
    },
  }, "Test mark updated successfully");
}

export function useDeleteCollegeTestMark() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (markId: number) => CollegeTestMarksService.delete(markId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.testMarks.root() });
    },
  }, "Test mark deleted successfully");
}

export function useBulkCreateCollegeTestMarks() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeCreateTestMarkBulk) =>
      CollegeTestMarksService.bulkCreate(payload) as Promise<CollegeTestMarkBulkCreateResult>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.testMarks.root() });
    },
  }, "Test marks created successfully");
}
