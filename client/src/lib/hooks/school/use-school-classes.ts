import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolClassesService } from "@/lib/services/school/classes.service";
import type {
  SchoolClassCreate,
  SchoolClassRead,
  SchoolClassUpdate,
  SchoolClassWithSubjects,
} from "@/lib/types/school";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useSchoolClasses(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: schoolKeys.classes.list(),
    queryFn: () => SchoolClassesService.list(),
    enabled: options?.enabled !== false,
  });
}

export function useCreateSchoolClass() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolClassCreate) =>
      SchoolClassesService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.classes.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.classes.root(), type: 'active' });
    },
  }, "Class created successfully");
}

export function useUpdateSchoolClass(classId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolClassUpdate) =>
      SchoolClassesService.update(classId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.classes.detail(classId) });
      void qc.invalidateQueries({ queryKey: schoolKeys.classes.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.classes.root(), type: 'active' });
    },
  }, "Class updated successfully");
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
      ),
    enabled: typeof classId === "number" && classId > 0,
  });
}

export function useDeleteSchoolClassSubject() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: ({
      classId,
      subjectId,
    }: {
      classId: number;
      subjectId: number;
    }) => SchoolClassesService.deleteClassSubject(classId, subjectId),
    onSuccess: (_, variables) => {
      // Invalidate all class-related queries
      void qc.invalidateQueries({ queryKey: schoolKeys.classSubjects.root() });
      void qc.invalidateQueries({ queryKey: schoolKeys.classes.root() });
      // Specifically invalidate the class detail query to refresh the subjects list
      void qc.invalidateQueries({ queryKey: schoolKeys.classes.detail(variables.classId) });
      // Refetch active queries
      void qc.refetchQueries({ queryKey: schoolKeys.classSubjects.root(), type: 'active' });
      void qc.refetchQueries({ queryKey: schoolKeys.classes.root(), type: 'active' });
    },
  }, "Subject removed from class successfully");
}
