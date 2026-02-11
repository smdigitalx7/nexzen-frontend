import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolTestMarksService } from "@/features/school/services/test-marks.service";
import type { CreateTestMarkBulk, TestMarkBulkCreateResult, TestMarkFullReadResponse, TestMarksQuery, TestGroupAndSubjectResponse, TestMarkCreate, TestMarkUpdate, CreateTestMarksMultipleSubjects, TestMarksMultipleSubjectsResult, CreateBulkMultipleStudentsTestRequest, BulkMultipleStudentsTestResponse } from "@/features/school/types";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";

export function useSchoolTestMarksList(params?: TestMarksQuery) {
  return useQuery({
    queryKey: schoolKeys.testMarks.list(params as Record<string, unknown> | undefined),
    queryFn: () => SchoolTestMarksService.list(params),
    enabled: 
      typeof params?.class_id === "number" && 
      params.class_id > 0 &&
      typeof params?.subject_id === "number" && 
      params.subject_id > 0 &&
      typeof params?.test_id === "number" && 
      params.test_id > 0,
    select: (data: unknown): any => {
      if (Array.isArray(data)) return data;
      if (data && typeof data === "object" && "data" in data) {
        return data;
      }
      return data;
    },
  });
}

export function useSchoolTestMark(markId: number | null | undefined) {
  return useQuery({
    queryKey: typeof markId === "number" ? schoolKeys.testMarks.detail(markId) : [...schoolKeys.testMarks.root(), "detail", "nil"],
    queryFn: () => SchoolTestMarksService.getById(markId as number),
    enabled: typeof markId === "number" && markId > 0,
  });
}

export function useCreateSchoolTestMark() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: TestMarkCreate) => SchoolTestMarksService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.testMarks.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.testMarks.root(), type: 'active' });
    },
  }, "Test mark created successfully");
}

export function useUpdateSchoolTestMark(markId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: TestMarkUpdate) => SchoolTestMarksService.update(markId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.testMarks.detail(markId) });
      void qc.invalidateQueries({ queryKey: schoolKeys.testMarks.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.testMarks.root(), type: 'active' });
    },
  }, "Test mark updated successfully");
}

export function useDeleteSchoolTestMark() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (markId: number) => SchoolTestMarksService.delete(markId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.testMarks.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.testMarks.root(), type: 'active' });
    },
  }, "Test mark deleted successfully");
}

export function useBulkCreateSchoolTestMarks() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CreateTestMarkBulk) => SchoolTestMarksService.bulkCreate(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.testMarks.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.testMarks.root(), type: 'active' });
    },
  }, "Test marks created successfully");
}

export function useCreateSchoolTestMarksMultipleSubjects() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CreateTestMarksMultipleSubjects) => SchoolTestMarksService.createMultipleSubjects(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.testMarks.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.testMarks.root(), type: 'active' });
    },
  }, "Test marks created successfully");
}

export function useBulkCreateMultipleStudentsTestMarks() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CreateBulkMultipleStudentsTestRequest) => SchoolTestMarksService.bulkMultipleStudents(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.testMarks.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.testMarks.root(), type: 'active' });
    },
  }, "Test marks created successfully");
}
