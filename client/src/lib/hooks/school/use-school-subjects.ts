import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolSubjectsService } from "@/lib/services/school/subjects.service";
import type { SchoolSubjectCreate, SchoolSubjectRead, SchoolSubjectUpdate, SchoolClassRead } from "@/lib/types/school";
import { schoolKeys } from "./query-keys";

export function useSchoolSubjects() {
  return useQuery({
    queryKey: schoolKeys.subjects.list(),
    queryFn: () => SchoolSubjectsService.list() as Promise<SchoolSubjectRead[]>,
  });
}

export function useCreateSchoolSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SchoolSubjectCreate) => SchoolSubjectsService.create(payload) as Promise<SchoolSubjectRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.subjects.root() });
    },
  });
}

export function useUpdateSchoolSubject(subjectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SchoolSubjectUpdate) => SchoolSubjectsService.update(subjectId, payload) as Promise<SchoolSubjectRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.subjects.detail(subjectId) });
      qc.invalidateQueries({ queryKey: schoolKeys.subjects.root() });
    },
  });
}

export function useDeleteSchoolSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (subjectId: number) => SchoolSubjectsService.delete(subjectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.subjects.root() });
    },
  });
}

export function useSchoolSubjectClasses(subjectId: number | null | undefined) {
  return useQuery({
    queryKey: typeof subjectId === "number" ? [...schoolKeys.subjects.detail(subjectId), "classes"] : [...schoolKeys.subjects.root(), "classes", "nil"],
    queryFn: () => SchoolSubjectsService.getClasses(subjectId as number) as Promise<SchoolClassRead[]>,
    enabled: typeof subjectId === "number" && subjectId > 0,
  });
}

export function useRemoveClassFromSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ subjectId, classId }: { subjectId: number; classId: number }) => SchoolSubjectsService.removeClassFromSubject(subjectId, classId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.subjects.root() });
    },
  });
}


