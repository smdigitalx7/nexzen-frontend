import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeTestMarksService } from "@/lib/services/college/test-marks.service";
import type { CollegeCreateTestMarkBulk, CollegeTestMarkBulkCreateResult, CollegeTestMarkFullReadResponse, CollegeTestMarkMinimalRead, CollegeTestMarkUpdate, CollegeTestMarksListParams } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";

export function useCollegeTestMarksList(params?: CollegeTestMarksListParams) {
  return useQuery({
    queryKey: collegeKeys.testMarks.list(params),
    queryFn: () => CollegeTestMarksService.list(params) as Promise<CollegeTestMarkMinimalRead[]>,
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
  return useMutation({
    mutationFn: (payload: CollegeTestMarkUpdate) => CollegeTestMarksService.create(payload) as Promise<CollegeTestMarkFullReadResponse>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.testMarks.root() });
    },
  });
}

export function useUpdateCollegeTestMark(markId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeTestMarkUpdate) => CollegeTestMarksService.update(markId, payload) as Promise<CollegeTestMarkFullReadResponse>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.testMarks.detail(markId) });
      qc.invalidateQueries({ queryKey: collegeKeys.testMarks.root() });
    },
  });
}

export function useDeleteCollegeTestMark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (markId: number) => CollegeTestMarksService.delete(markId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.testMarks.root() });
    },
  });
}

export function useBulkCreateCollegeTestMarks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeCreateTestMarkBulk) =>
      CollegeTestMarksService.bulkCreate(payload) as Promise<CollegeTestMarkBulkCreateResult>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.testMarks.root() });
    },
  });
}
