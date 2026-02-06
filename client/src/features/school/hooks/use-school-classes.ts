import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolClassesService } from "@/features/school/services/classes.service";
import type {
  SchoolClassCreate,
  SchoolClassRead,
  SchoolClassUpdate,
  SchoolClassWithSubjects,
} from "@/features/school/types";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";

export function useSchoolClasses(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: schoolKeys.classes.list(),
    queryFn: () => SchoolClassesService.list(),
    enabled: options?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes - classes don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    select: (data: any) => (Array.isArray(data) ? data : data.data || []),
  });
}

export function useCreateSchoolClass() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolClassCreate) =>
      SchoolClassesService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.classes.root() }).catch(console.error);
      qc.refetchQueries({ queryKey: schoolKeys.classes.root(), type: 'active' }).catch(console.error);
    },
  }, "Class created successfully");
}

export function useUpdateSchoolClass(classId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolClassUpdate) =>
      SchoolClassesService.update(classId, payload),
    onSuccess: () => {
      // Invalidate class-related queries
      qc.invalidateQueries({ queryKey: schoolKeys.classes.detail(classId) }).catch(console.error);
      qc.invalidateQueries({ queryKey: schoolKeys.classes.root() }).catch(console.error);
      // Invalidate cross-module caches that depend on classes
      qc.invalidateQueries({ queryKey: schoolKeys.classSubjects.root() }).catch(console.error);
      qc.invalidateQueries({ queryKey: schoolKeys.teacherClassSubjects.root() }).catch(console.error);
      // Refetch active queries
      qc.refetchQueries({ queryKey: schoolKeys.classes.root(), type: 'active' }).catch(console.error);
    },
  }, "Class updated successfully");
}

export function useSchoolClassById(classId: number | null | undefined) {
  return useQuery({
    queryKey: schoolKeys.classes.detail(classId || 0),
    queryFn: () => SchoolClassesService.getById(classId as number),
    enabled: typeof classId === "number" && classId > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
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
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
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
      qc.invalidateQueries({ queryKey: schoolKeys.classSubjects.root() }).catch(console.error);
      qc.invalidateQueries({ queryKey: schoolKeys.classes.root() }).catch(console.error);
      // Specifically invalidate the class detail query to refresh the subjects list
      qc.invalidateQueries({ queryKey: schoolKeys.classes.detail(variables.classId) }).catch(console.error);
      // Refetch active queries
      qc.refetchQueries({ queryKey: schoolKeys.classSubjects.root(), type: 'active' }).catch(console.error);
      qc.refetchQueries({ queryKey: schoolKeys.classes.root(), type: 'active' }).catch(console.error);
    },
  }, "Subject removed from class successfully");
}
