import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolSubjectsService } from "@/lib/services/school/subjects.service";
import type {
  SchoolSubjectCreate,
  SchoolSubjectRead,
  SchoolSubjectUpdate,
  SchoolClassRead,
} from "@/lib/types/school";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useSchoolSubjects(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: schoolKeys.subjects.list(),
    queryFn: () => SchoolSubjectsService.list(),
    enabled: options?.enabled !== false,
  });
}

export function useCreateSchoolSubject() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolSubjectCreate) =>
      SchoolSubjectsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.subjects.root() });
    },
  }, "Subject created successfully");
}

export function useUpdateSchoolSubject(subjectId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolSubjectUpdate) =>
      SchoolSubjectsService.update(
        subjectId,
        payload
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.subjects.detail(subjectId) });
      qc.invalidateQueries({ queryKey: schoolKeys.subjects.root() });
    },
  }, "Subject updated successfully");
}

export function useDeleteSchoolSubject() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (subjectId: number) => SchoolSubjectsService.delete(subjectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.subjects.root() });
    },
  }, "Subject deleted successfully");
}

export function useSchoolSubjectClasses(subjectId: number | null | undefined) {
  return useQuery({
    queryKey:
      typeof subjectId === "number"
        ? [...schoolKeys.subjects.detail(subjectId), "classes"]
        : [...schoolKeys.subjects.root(), "classes", "nil"],
    queryFn: () =>
      SchoolSubjectsService.getClasses(subjectId as number),
    enabled: typeof subjectId === "number" && subjectId > 0,
  });
}

export function useRemoveClassFromSubject() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: ({
      subjectId,
      classId,
    }: {
      subjectId: number;
      classId: number;
    }) => SchoolSubjectsService.removeClassFromSubject(subjectId, classId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.subjects.root() });
    },
  }, "Class removed from subject successfully");
}
