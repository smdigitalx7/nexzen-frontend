import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolTestMarksService } from "@/lib/services/school/test-marks.service";
import type { CreateTestMarkBulk, TestMarkBulkCreateResult, TestMarkFullReadResponse, TestMarksQuery, TestGroupAndSubjectResponse, TestMarkCreate, TestMarkUpdate } from "@/lib/types/school";
import { schoolKeys } from "./query-keys";

export function useSchoolTestMarksList(params?: TestMarksQuery) {
  return useQuery({
    queryKey: schoolKeys.testMarks.list(params as Record<string, unknown> | undefined),
    queryFn: () => SchoolTestMarksService.list(params) as Promise<TestGroupAndSubjectResponse[]>,
    enabled: typeof params?.class_id === "number" && (params?.class_id as number) > 0,
  });
}

export function useSchoolTestMark(markId: number | null | undefined) {
  return useQuery({
    queryKey: typeof markId === "number" ? schoolKeys.testMarks.detail(markId) : [...schoolKeys.testMarks.root(), "detail", "nil"],
    queryFn: () => SchoolTestMarksService.getById(markId as number) as Promise<TestMarkFullReadResponse>,
    enabled: typeof markId === "number" && markId > 0,
  });
}

export function useCreateSchoolTestMark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TestMarkCreate) => SchoolTestMarksService.create(payload) as Promise<TestMarkFullReadResponse>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.testMarks.root() });
    },
  });
}

export function useUpdateSchoolTestMark(markId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TestMarkUpdate) => SchoolTestMarksService.update(markId, payload) as Promise<TestMarkFullReadResponse>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.testMarks.detail(markId) });
      qc.invalidateQueries({ queryKey: schoolKeys.testMarks.root() });
    },
  });
}

export function useDeleteSchoolTestMark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (markId: number) => SchoolTestMarksService.delete(markId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.testMarks.root() });
    },
  });
}

export function useBulkCreateSchoolTestMarks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTestMarkBulk) => SchoolTestMarksService.bulkCreate(payload) as Promise<TestMarkBulkCreateResult>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.testMarks.root() });
    },
  });
}


