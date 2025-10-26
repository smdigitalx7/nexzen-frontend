import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolExamsService } from "@/lib/services/school/exams.service";
import { SchoolTestsService } from "@/lib/services/school/tests.service";
import type {
  SchoolExamCreate,
  SchoolExamRead,
  SchoolExamUpdate,
  SchoolTestCreate,
  SchoolTestRead,
  SchoolTestUpdate,
} from "@/lib/types/school";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useSchoolExams(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: schoolKeys.exams.list(),
    queryFn: () => SchoolExamsService.list() as Promise<SchoolExamRead[]>,
    enabled: options?.enabled !== false,
  });
}

export function useSchoolExam(examId: number | null | undefined) {
  return useQuery({
    queryKey:
      typeof examId === "number"
        ? schoolKeys.exams.detail(examId)
        : [...schoolKeys.exams.root(), "detail", "nil"],
    queryFn: () =>
      SchoolExamsService.getById(examId as number) as Promise<SchoolExamRead>,
    enabled: typeof examId === "number" && examId > 0,
  });
}

export function useSchoolTests(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: schoolKeys.tests.list(),
    queryFn: () => SchoolTestsService.list() as Promise<SchoolTestRead[]>,
    enabled: options?.enabled !== false,
  });
}

export function useSchoolTest(testId: number | null | undefined) {
  return useQuery({
    queryKey:
      typeof testId === "number"
        ? schoolKeys.tests.detail(testId)
        : [...schoolKeys.tests.root(), "detail", "nil"],
    queryFn: () =>
      SchoolTestsService.getById(testId as number) as Promise<SchoolTestRead>,
    enabled: typeof testId === "number" && testId > 0,
  });
}

// Mutations: Exams
export function useCreateSchoolExam() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolExamCreate) =>
      SchoolExamsService.create(payload) as Promise<SchoolExamRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.exams.list() });
    },
  }, "Exam created successfully");
}

export function useUpdateSchoolExam(examId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolExamUpdate) =>
      SchoolExamsService.update(examId, payload) as Promise<SchoolExamRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.exams.detail(examId) });
      qc.invalidateQueries({ queryKey: schoolKeys.exams.list() });
    },
  }, "Exam updated successfully");
}

export function useDeleteSchoolExam() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (examId: number) =>
      SchoolExamsService.delete(examId) as Promise<void>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.exams.list() });
    },
  }, "Exam deleted successfully");
}

// Mutations: Tests
export function useCreateSchoolTest() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolTestCreate) =>
      SchoolTestsService.create(payload) as Promise<SchoolTestRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.tests.list() });
    },
  }, "Test created successfully");
}

export function useUpdateSchoolTest(testId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolTestUpdate) =>
      SchoolTestsService.update(testId, payload) as Promise<SchoolTestRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.tests.detail(testId) });
      qc.invalidateQueries({ queryKey: schoolKeys.tests.list() });
    },
  }, "Test updated successfully");
}

export function useDeleteSchoolTest() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (testId: number) =>
      SchoolTestsService.delete(testId) as Promise<void>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.tests.list() });
    },
  }, "Test deleted successfully");
}
