import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolSubjectsService } from "@/features/school/services/subjects.service";
import type {
  SchoolSubjectCreate,
  SchoolSubjectRead,
  SchoolSubjectUpdate,
  SchoolClassRead,
} from "@/features/school/types";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";

export function useSchoolSubjects(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: schoolKeys.subjects.list(),
    queryFn: () => SchoolSubjectsService.list(),
    enabled: options?.enabled === true, // ✅ OPTIMIZATION: Only fetch when explicitly enabled (on-demand)
    staleTime: 5 * 60 * 1000, // 5 minutes - subjects don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    select: (data: any) => (Array.isArray(data) ? data : data.data || []),
  });
}

export function useCreateSchoolSubject() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolSubjectCreate) =>
      SchoolSubjectsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.subjects.root() }).catch(console.error);
      qc.refetchQueries({ queryKey: schoolKeys.subjects.root(), type: 'active' }).catch(console.error);
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
      // Invalidate subject-related queries
      qc.invalidateQueries({ queryKey: schoolKeys.subjects.detail(subjectId) }).catch(console.error);
      qc.invalidateQueries({ queryKey: schoolKeys.subjects.root() }).catch(console.error);
      // Invalidate cross-module caches that depend on subjects
      qc.invalidateQueries({ queryKey: schoolKeys.classSubjects.root() }).catch(console.error);
      qc.invalidateQueries({ queryKey: schoolKeys.teacherClassSubjects.root() }).catch(console.error);
      qc.invalidateQueries({ queryKey: schoolKeys.classes.root() }).catch(console.error);
      // Refetch active queries
      qc.refetchQueries({ queryKey: schoolKeys.subjects.root(), type: 'active' }).catch(console.error);
      qc.refetchQueries({ queryKey: schoolKeys.classes.root(), type: 'active' }).catch(console.error);
    },
  }, "Subject updated successfully");
}

export function useDeleteSchoolSubject() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (subjectId: number) => SchoolSubjectsService.delete(subjectId),
    onSuccess: () => {
      // Invalidate all related caches
      qc.invalidateQueries({ queryKey: schoolKeys.subjects.root() }).catch(console.error);
      qc.invalidateQueries({ queryKey: schoolKeys.classSubjects.root() }).catch(console.error);
      qc.invalidateQueries({ queryKey: schoolKeys.teacherClassSubjects.root() }).catch(console.error);
      qc.invalidateQueries({ queryKey: schoolKeys.classes.root() }).catch(console.error);
      // Refetch active queries
      qc.refetchQueries({ queryKey: schoolKeys.subjects.root(), type: 'active' }).catch(console.error);
      qc.refetchQueries({ queryKey: schoolKeys.classes.root(), type: 'active' }).catch(console.error);
      qc.refetchQueries({ queryKey: schoolKeys.teacherClassSubjects.root(), type: 'active' }).catch(console.error);
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
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
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
      qc.invalidateQueries({ queryKey: schoolKeys.subjects.root() }).catch(console.error);
      qc.invalidateQueries({ queryKey: schoolKeys.classes.root() }).catch(console.error);
      qc.invalidateQueries({ queryKey: schoolKeys.classSubjects.root() }).catch(console.error);
      qc.refetchQueries({ queryKey: schoolKeys.subjects.root(), type: 'active' }).catch(console.error);
      qc.refetchQueries({ queryKey: schoolKeys.classes.root(), type: 'active' }).catch(console.error);
    },
  }, "Class removed from subject successfully");
}
