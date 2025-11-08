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
    staleTime: 30 * 1000, // 30 seconds - sections change more frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateSchoolSection(classId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolSectionCreate) => SchoolSectionsService.create(classId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.sections.listByClass(classId) }).catch(console.error);
      qc.refetchQueries({ queryKey: schoolKeys.sections.listByClass(classId), type: 'active' }).catch(console.error);
      // Invalidate dropdown cache
      qc.invalidateQueries({ queryKey: ["school-dropdowns", "sections", classId] }).catch(console.error);
    },
  }, "Section created successfully");
}

export function useUpdateSchoolSection(classId: number, sectionId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolSectionUpdate) => SchoolSectionsService.update(classId, sectionId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.sections.detail(classId, sectionId) }).catch(console.error);
      qc.invalidateQueries({ queryKey: schoolKeys.sections.listByClass(classId) }).catch(console.error);
      qc.refetchQueries({ queryKey: schoolKeys.sections.listByClass(classId), type: 'active' }).catch(console.error);
      // Invalidate dropdown cache
      qc.invalidateQueries({ queryKey: ["school-dropdowns", "sections", classId] }).catch(console.error);
    },
  }, "Section updated successfully");
}

export function useDeleteSchoolSection(classId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (sectionId: number) => SchoolSectionsService.delete(classId, sectionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.sections.listByClass(classId) }).catch(console.error);
      qc.refetchQueries({ queryKey: schoolKeys.sections.listByClass(classId), type: 'active' }).catch(console.error);
      // Invalidate dropdown cache
      qc.invalidateQueries({ queryKey: ["school-dropdowns", "sections", classId] }).catch(console.error);
    },
  }, "Section deleted successfully");
}


