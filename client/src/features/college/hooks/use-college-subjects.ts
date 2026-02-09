import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeSubjectsService } from "@/features/college/services/subjects.service";
import type {
  CollegeCreateSubject,
  CollegeGroupSubjectCreate,
  CollegeGroupSubjectRead,
  CollegeGroupSubjectUpdate,
  CollegeSubjectList,
  CollegeSubjectResponse,
  CollegeUpdateSubject,
} from "@/features/college/types/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";
import { invalidateAndRefetch } from "@/common/hooks/useGlobalRefetch";

export function useCollegeSubjects(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: collegeKeys.subjects.list(),
    queryFn: () =>
      CollegeSubjectsService.list() as Promise<CollegeSubjectResponse[]>,
    enabled: options?.enabled !== false,
  });
}

export function useCollegeSubjectsSlim() {
  return useQuery({
    queryKey: collegeKeys.subjects.listSlim(),
    queryFn: () =>
      CollegeSubjectsService.listSlim(),
  });
}

export function useCreateCollegeSubject() {
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeCreateSubject) =>
      CollegeSubjectsService.create(payload),
    onSuccess: () => {
      invalidateAndRefetch(collegeKeys.subjects.root());
      invalidateAndRefetch(collegeKeys.enrollments.academicTotal());
    },
  }, "Subject created successfully");
}

export function useUpdateCollegeSubject(subjectId: number) {
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeUpdateSubject) =>
      CollegeSubjectsService.update(
        subjectId,
        payload
      ),
    onSuccess: () => {
      invalidateAndRefetch(collegeKeys.subjects.detail(subjectId));
      invalidateAndRefetch(collegeKeys.subjects.root());
      invalidateAndRefetch(collegeKeys.enrollments.academicTotal());
    },
  }, "Subject updated successfully");
}

export function useDeleteCollegeSubject() {
  return useMutationWithSuccessToast({
    mutationFn: (subjectId: number) => CollegeSubjectsService.delete(subjectId),
    onSuccess: () => {
      invalidateAndRefetch(collegeKeys.subjects.root());
      invalidateAndRefetch(collegeKeys.enrollments.academicTotal());
    },
  }, "Subject deleted successfully");
}

export function useAddSubjectToGroup(subjectId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeGroupSubjectCreate) =>
      CollegeSubjectsService.addToGroup(
        subjectId,
        payload
      ),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: [...collegeKeys.subjects.detail(subjectId), "groups"],
      });
      void qc.refetchQueries({
        queryKey: [...collegeKeys.subjects.detail(subjectId), "groups"],
        type: 'active'
      });
    },
  }, "Subject added to group successfully");
}

export function useUpdateSubjectGroupRelation(
  subjectId: number,
  groupId: number
) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeGroupSubjectUpdate) =>
      CollegeSubjectsService.updateGroupRelation(
        subjectId,
        groupId,
        payload
      ),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: [...collegeKeys.subjects.detail(subjectId), "groups"],
      });
      void qc.refetchQueries({
        queryKey: [...collegeKeys.subjects.detail(subjectId), "groups"],
        type: 'active'
      });
    },
  }, "Subject group relation updated successfully");
}
