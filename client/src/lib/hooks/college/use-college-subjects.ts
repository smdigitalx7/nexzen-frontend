import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeSubjectsService } from "@/lib/services/college/subjects.service";
import type {
  CollegeCreateSubject,
  CollegeGroupSubjectCreate,
  CollegeGroupSubjectRead,
  CollegeGroupSubjectUpdate,
  CollegeSubjectList,
  CollegeSubjectResponse,
  CollegeUpdateSubject,
} from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

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
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeCreateSubject) =>
      CollegeSubjectsService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.subjects.root() });
    },
  }, "Subject created successfully");
}

export function useUpdateCollegeSubject(subjectId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeUpdateSubject) =>
      CollegeSubjectsService.update(
        subjectId,
        payload
      ),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: collegeKeys.subjects.detail(subjectId),
      });
      void qc.invalidateQueries({ queryKey: collegeKeys.subjects.root() });
    },
  }, "Subject updated successfully");
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
    },
  }, "Subject group relation updated successfully");
}
