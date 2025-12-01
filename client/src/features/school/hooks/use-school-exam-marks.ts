import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolExamMarksService } from "@/features/school/services/exam-marks.service";
import type { CreateExamMarkBulk, ExamMarkBulkCreateResult, ExamMarkFullReadResponse, ExamMarksQuery, ExamGroupAndSubjectResponse, ExamMarkCreate, ExamMarkUpdate, CreateExamMarksMultipleSubjects, ExamMarksMultipleSubjectsResult, CreateBulkMultipleStudentsRequest, BulkMultipleStudentsResponse } from "@/features/school/types";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";

export function useSchoolExamMarksList(params?: ExamMarksQuery) {
  return useQuery({
    queryKey: schoolKeys.examMarks.list(params as Record<string, unknown> | undefined),
    queryFn: () => SchoolExamMarksService.list(params!),
    enabled: 
      typeof params?.class_id === "number" && 
      params.class_id > 0 &&
      typeof params?.subject_id === "number" && 
      params.subject_id > 0 &&
      typeof params?.exam_id === "number" && 
      params.exam_id > 0,
    // section_id is optional, so we don't check it in enabled condition
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
      void qc.invalidateQueries({ queryKey: schoolKeys.examMarks.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.examMarks.root(), type: 'active' });
    },
  }, "Exam mark created successfully");
}

export function useUpdateSchoolExamMark(markId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: ExamMarkUpdate) => SchoolExamMarksService.update(markId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.examMarks.detail(markId) });
      void qc.invalidateQueries({ queryKey: schoolKeys.examMarks.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.examMarks.root(), type: 'active' });
    },
  }, "Exam mark updated successfully");
}

export function useDeleteSchoolExamMark() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (markId: number) => SchoolExamMarksService.delete(markId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.examMarks.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.examMarks.root(), type: 'active' });
    },
  }, "Exam mark deleted successfully");
}

export function useBulkCreateSchoolExamMarks() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CreateExamMarkBulk) => SchoolExamMarksService.bulkCreate(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.examMarks.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.examMarks.root(), type: 'active' });
    },
  }, "Exam marks created successfully");
}

export function useCreateSchoolExamMarksMultipleSubjects() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CreateExamMarksMultipleSubjects) => SchoolExamMarksService.createMultipleSubjects(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.examMarks.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.examMarks.root(), type: 'active' });
    },
  }, "Exam marks created successfully");
}

export function useBulkCreateMultipleStudentsExamMarks() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CreateBulkMultipleStudentsRequest) => SchoolExamMarksService.bulkMultipleStudents(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.examMarks.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.examMarks.root(), type: 'active' });
    },
  }, "Bulk exam marks created successfully");
}


