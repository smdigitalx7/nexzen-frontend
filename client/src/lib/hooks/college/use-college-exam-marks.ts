import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeExamMarksService } from "@/lib/services/college/exam-marks.service";
import type { CollegeCreateExamMarkBulk, CollegeExamMarkBulkCreateResult, CollegeExamMarkCreate, CollegeExamMarkFullReadResponse, CollegeExamMarkMinimalRead, CollegeExamMarkUpdate, CollegeExamMarksListParams, CollegeCreateExamMarksMultipleSubjects, CollegeExamMarksMultipleSubjectsResult } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useCollegeExamMarksList(params?: CollegeExamMarksListParams) {
  return useQuery({
    queryKey: collegeKeys.examMarks.list(params),
    queryFn: () => CollegeExamMarksService.list(params),
    enabled: !!params && !!params.class_id && !!params.group_id,
  });
}

export function useCollegeExamMark(markId: number | null | undefined) {
  return useQuery({
    queryKey: typeof markId === "number" ? collegeKeys.examMarks.detail(markId) : [...collegeKeys.examMarks.root(), "detail", "nil"],
    queryFn: () => CollegeExamMarksService.getById(markId as number),
    enabled: typeof markId === "number" && markId > 0,
  });
}

export function useCreateCollegeExamMark() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeExamMarkCreate) => CollegeExamMarksService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.examMarks.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.examMarks.root(), type: 'active' });
    },
  }, "Exam mark created successfully");
}

export function useUpdateCollegeExamMark(markId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeExamMarkUpdate) => CollegeExamMarksService.update(markId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.examMarks.detail(markId) });
      void qc.invalidateQueries({ queryKey: collegeKeys.examMarks.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.examMarks.root(), type: 'active' });
    },
  }, "Exam mark updated successfully");
}

export function useDeleteCollegeExamMark() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (markId: number) => CollegeExamMarksService.delete(markId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.examMarks.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.examMarks.root(), type: 'active' });
    },
  }, "Exam mark deleted successfully");
}

export function useBulkCreateCollegeExamMarks() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeCreateExamMarkBulk) =>
      CollegeExamMarksService.bulkCreate(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.examMarks.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.examMarks.root(), type: 'active' });
    },
  }, "Exam marks created successfully");
}

export function useCreateCollegeExamMarksMultipleSubjects() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeCreateExamMarksMultipleSubjects) => CollegeExamMarksService.createMultipleSubjects(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.examMarks.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.examMarks.root(), type: 'active' });
    },
  }, "Exam marks created successfully");
}
