import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolSectionsService } from "@/lib/services/school/sections.service";
import type { SchoolSectionCreate, SchoolSectionRead, SchoolSectionUpdate } from "@/lib/types/school";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useSchoolSectionsByClass(classId: number | null | undefined) {
  return useQuery({
    queryKey: typeof classId === "number" ? schoolKeys.sections.listByClass(classId) : [...schoolKeys.sections.root(), "by-class", "nil"],
    queryFn: () => SchoolSectionsService.listByClass(classId as number),
    enabled: typeof classId === "number" && classId > 0,
  });
}

export function useCreateSchoolSection(classId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolSectionCreate) => SchoolSectionsService.create(classId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.sections.listByClass(classId) });
      void qc.refetchQueries({ queryKey: schoolKeys.sections.listByClass(classId), type: 'active' });
    },
  }, "Section created successfully");
}

export function useUpdateSchoolSection(classId: number, sectionId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolSectionUpdate) => SchoolSectionsService.update(classId, sectionId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.sections.detail(classId, sectionId) });
      void qc.invalidateQueries({ queryKey: schoolKeys.sections.listByClass(classId) });
      void qc.refetchQueries({ queryKey: schoolKeys.sections.listByClass(classId), type: 'active' });
    },
  }, "Section updated successfully");
}

export function useDeleteSchoolSection(classId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (sectionId: number) => SchoolSectionsService.delete(classId, sectionId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.sections.listByClass(classId) });
      void qc.refetchQueries({ queryKey: schoolKeys.sections.listByClass(classId), type: 'active' });
    },
  }, "Section deleted successfully");
}


