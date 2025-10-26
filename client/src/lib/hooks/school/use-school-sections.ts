import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolSectionsService } from "@/lib/services/school/sections.service";
import type { SchoolSectionCreate, SchoolSectionRead, SchoolSectionUpdate } from "@/lib/types/school";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useSchoolSectionsByClass(classId: number | null | undefined) {
  return useQuery({
    queryKey: typeof classId === "number" ? schoolKeys.sections.listByClass(classId) : [...schoolKeys.sections.root(), "by-class", "nil"],
    queryFn: () => SchoolSectionsService.listByClass(classId as number) as Promise<SchoolSectionRead[]>,
    enabled: typeof classId === "number" && classId > 0,
  });
}

export function useCreateSchoolSection(classId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolSectionCreate) => SchoolSectionsService.create(classId, payload) as Promise<SchoolSectionRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.sections.listByClass(classId) });
    },
  }, "Section created successfully");
}

export function useUpdateSchoolSection(classId: number, sectionId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolSectionUpdate) => SchoolSectionsService.update(classId, sectionId, payload) as Promise<SchoolSectionRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.sections.detail(classId, sectionId) });
      qc.invalidateQueries({ queryKey: schoolKeys.sections.listByClass(classId) });
    },
  }, "Section updated successfully");
}


