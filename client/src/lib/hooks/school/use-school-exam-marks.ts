import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolExamMarksService } from "@/lib/services/school/exam-marks.service";
import type { CreateExamMarkBulk, ExamMarkBulkCreateResult, ExamMarkFullReadResponse, ExamMarksQuery, ExamGroupAndSubjectResponse, ExamMarkCreate, ExamMarkUpdate } from "@/lib/types/school";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useSchoolExamMarksList(params?: ExamMarksQuery) {
  return useQuery({
    queryKey: schoolKeys.examMarks.list(params as Record<string, unknown> | undefined),
    queryFn: () => SchoolExamMarksService.list(params),
    enabled: !!params?.class_id,
  });
}

export function useSchoolExamMark(markId: number | null | undefined) {
  return useQuery({
    queryKey: typeof markId === "number" ? schoolKeys.examMarks.detail(markId) : [...schoolKeys.examMarks.root(), "detail", "nil"],
    queryFn: () => SchoolExamMarksService.getById(markId as number),
    enabled: typeof markId === "number" && markId > 0,
  });
}

export function useCreateSchoolExamMark() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: ExamMarkCreate) => SchoolExamMarksService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.examMarks.root() });
    },
  }, "Exam mark created successfully");
}

export function useUpdateSchoolExamMark(markId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: ExamMarkUpdate) => SchoolExamMarksService.update(markId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.examMarks.detail(markId) });
      qc.invalidateQueries({ queryKey: schoolKeys.examMarks.root() });
    },
  }, "Exam mark updated successfully");
}

export function useDeleteSchoolExamMark() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (markId: number) => SchoolExamMarksService.delete(markId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.examMarks.root() });
    },
  }, "Exam mark deleted successfully");
}

export function useBulkCreateSchoolExamMarks() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CreateExamMarkBulk) => SchoolExamMarksService.bulkCreate(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.examMarks.root() });
    },
  }, "Exam marks created successfully");
}


