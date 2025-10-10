import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeExamMarksService } from "@/lib/services/college/exam-marks.service";
import type { CollegeCreateExamMarkBulk, CollegeExamMarkBulkCreateResult, CollegeExamMarkFullReadResponse, CollegeExamMarksListParams } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";

export function useCollegeExamMarksList(params?: CollegeExamMarksListParams) {
  return useQuery({
    queryKey: collegeKeys.examMarks.list(params as Record<string, unknown> | undefined),
    queryFn: () => CollegeExamMarksService.list(params) as Promise<any>,
  });
}

export function useCollegeExamMark(markId: number | null | undefined) {
  return useQuery({
    queryKey: typeof markId === "number" ? collegeKeys.examMarks.detail(markId) : [...collegeKeys.examMarks.root(), "detail", "nil"],
    queryFn: () => CollegeExamMarksService.getById(markId as number) as Promise<CollegeExamMarkFullReadResponse>,
    enabled: typeof markId === "number" && markId > 0,
  });
}

export function useCreateCollegeExamMark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => CollegeExamMarksService.create(payload) as Promise<CollegeExamMarkFullReadResponse>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.examMarks.root() });
    },
  });
}

export function useUpdateCollegeExamMark(markId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => CollegeExamMarksService.update(markId, payload) as Promise<CollegeExamMarkFullReadResponse>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.examMarks.detail(markId) });
      qc.invalidateQueries({ queryKey: collegeKeys.examMarks.root() });
    },
  });
}

export function useDeleteCollegeExamMark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (markId: number) => CollegeExamMarksService.delete(markId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.examMarks.root() });
    },
  });
}

export function useBulkCreateCollegeExamMarks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeCreateExamMarkBulk) =>
      CollegeExamMarksService.bulkCreate(payload) as Promise<CollegeExamMarkBulkCreateResult>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.examMarks.root() });
    },
  });
}


