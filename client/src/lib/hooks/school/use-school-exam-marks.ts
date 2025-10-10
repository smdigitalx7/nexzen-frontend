import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolExamMarksService } from "@/lib/services/school/exam-marks.service";
import type { CreateExamMarkBulk, ExamMarkBulkCreateResult, ExamMarkFullReadResponse, ExamMarksQuery, ExamGroupAndSubjectResponse, ExamMarkCreate, ExamMarkUpdate } from "@/lib/types/school";
import { schoolKeys } from "./query-keys";

export function useSchoolExamMarksList(params?: ExamMarksQuery) {
  return useQuery({
    queryKey: schoolKeys.examMarks.list(params as Record<string, unknown> | undefined),
    queryFn: () => SchoolExamMarksService.list(params) as Promise<ExamGroupAndSubjectResponse[]>,
    enabled: !!params?.class_id,
  });
}

export function useSchoolExamMark(markId: number | null | undefined) {
  return useQuery({
    queryKey: typeof markId === "number" ? schoolKeys.examMarks.detail(markId) : [...schoolKeys.examMarks.root(), "detail", "nil"],
    queryFn: () => SchoolExamMarksService.getById(markId as number) as Promise<ExamMarkFullReadResponse>,
    enabled: typeof markId === "number" && markId > 0,
  });
}

export function useCreateSchoolExamMark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ExamMarkCreate) => SchoolExamMarksService.create(payload) as Promise<ExamMarkFullReadResponse>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.examMarks.root() });
    },
  });
}

export function useUpdateSchoolExamMark(markId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ExamMarkUpdate) => SchoolExamMarksService.update(markId, payload) as Promise<ExamMarkFullReadResponse>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.examMarks.detail(markId) });
      qc.invalidateQueries({ queryKey: schoolKeys.examMarks.root() });
    },
  });
}

export function useDeleteSchoolExamMark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (markId: number) => SchoolExamMarksService.delete(markId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.examMarks.root() });
    },
  });
}

export function useBulkCreateSchoolExamMarks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExamMarkBulk) => SchoolExamMarksService.bulkCreate(payload) as Promise<ExamMarkBulkCreateResult>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.examMarks.root() });
    },
  });
}


