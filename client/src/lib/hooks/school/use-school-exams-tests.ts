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
    queryFn: () => SchoolExamsService.list(),
    enabled: options?.enabled !== false,
    staleTime: 2 * 60 * 1000, // 2 minutes - exams change moderately
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSchoolExam(examId: number | null | undefined) {
  return useQuery({
    queryKey:
      typeof examId === "number"
        ? schoolKeys.exams.detail(examId)
        : [...schoolKeys.exams.root(), "detail", "nil"],
    queryFn: () =>
      SchoolExamsService.getById(examId as number),
    enabled: typeof examId === "number" && examId > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSchoolTests(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: schoolKeys.tests.list(),
    queryFn: () => SchoolTestsService.list(),
    enabled: options?.enabled !== false,
    staleTime: 2 * 60 * 1000, // 2 minutes - tests change moderately
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSchoolTest(testId: number | null | undefined) {
  return useQuery({
    queryKey:
      typeof testId === "number"
        ? schoolKeys.tests.detail(testId)
        : [...schoolKeys.tests.root(), "detail", "nil"],
    queryFn: () =>
      SchoolTestsService.getById(testId as number),
    enabled: typeof testId === "number" && testId > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Mutations: Exams
export function useCreateSchoolExam() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolExamCreate) =>
      SchoolExamsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.exams.root() }).catch(console.error);
      qc.refetchQueries({ queryKey: schoolKeys.exams.root(), type: 'active' }).catch(console.error);
    },
  }, "Exam created successfully");
}

export function useUpdateSchoolExam(examId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolExamUpdate) =>
      SchoolExamsService.update(examId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.exams.detail(examId) }).catch(console.error);
      qc.invalidateQueries({ queryKey: schoolKeys.exams.root() }).catch(console.error);
      qc.refetchQueries({ queryKey: schoolKeys.exams.root(), type: 'active' }).catch(console.error);
    },
  }, "Exam updated successfully");
}

export function useDeleteSchoolExam() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (examId: number) =>
      SchoolExamsService.delete(examId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.exams.root() }).catch(console.error);
      qc.refetchQueries({ queryKey: schoolKeys.exams.root(), type: 'active' }).catch(console.error);
    },
  }, "Exam deleted successfully");
}

// Mutations: Tests
export function useCreateSchoolTest() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolTestCreate) =>
      SchoolTestsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.tests.root() }).catch(console.error);
      qc.refetchQueries({ queryKey: schoolKeys.tests.root(), type: 'active' }).catch(console.error);
    },
  }, "Test created successfully");
}

export function useUpdateSchoolTest(testId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolTestUpdate) =>
      SchoolTestsService.update(testId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.tests.detail(testId) }).catch(console.error);
      qc.invalidateQueries({ queryKey: schoolKeys.tests.root() }).catch(console.error);
      qc.refetchQueries({ queryKey: schoolKeys.tests.root(), type: 'active' }).catch(console.error);
    },
  }, "Test updated successfully");
}

export function useDeleteSchoolTest() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (testId: number) =>
      SchoolTestsService.delete(testId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.tests.root() }).catch(console.error);
      qc.refetchQueries({ queryKey: schoolKeys.tests.root(), type: 'active' }).catch(console.error);
    },
  }, "Test deleted successfully");
}
