import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolClassesService } from "@/lib/services/school/classes.service";
import type {
  SchoolClassCreate,
  SchoolClassRead,
  SchoolClassUpdate,
  SchoolClassWithSubjects,
} from "@/lib/types/school";
import { schoolKeys } from "./query-keys";

export function useSchoolClasses(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: schoolKeys.classes.list(),
    queryFn: () => SchoolClassesService.list() as Promise<SchoolClassRead[]>,
    enabled: options?.enabled !== false,
  });
}

export function useCreateSchoolClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SchoolClassCreate) =>
      SchoolClassesService.create(payload) as Promise<SchoolClassRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.classes.root() });
    },
  });
}

export function useUpdateSchoolClass(classId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SchoolClassUpdate) =>
      SchoolClassesService.update(classId, payload) as Promise<SchoolClassRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.classes.detail(classId) });
      qc.invalidateQueries({ queryKey: schoolKeys.classes.root() });
    },
  });
}

export function useSchoolClassById(classId: number | null | undefined) {
  return useQuery({
    queryKey: schoolKeys.classes.detail(classId || 0),
    queryFn: () => SchoolClassesService.getById(classId as number),
    enabled: typeof classId === "number" && classId > 0,
  });
}

export function useSchoolClassSubjects(classId: number | null | undefined) {
  return useQuery({
    queryKey:
      typeof classId === "number"
        ? [...schoolKeys.classes.detail(classId), "subjects"]
        : [...schoolKeys.classes.root(), "subjects", "nil"],
    queryFn: () =>
      SchoolClassesService.getSubjects(
        classId as number
      ) as Promise<SchoolClassWithSubjects>,
    enabled: typeof classId === "number" && classId > 0,
  });
}

export function useDeleteSchoolClassSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      classId,
      subjectId,
    }: {
      classId: number;
      subjectId: number;
    }) => SchoolClassesService.deleteClassSubject(classId, subjectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.classes.root() });
    },
  });
}
