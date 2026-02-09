import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolSectionsService } from "@/features/school/services/sections.service";
import type { SchoolSectionCreate, SchoolSectionRead, SchoolSectionUpdate } from "@/features/school/types";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";

export function useSchoolSectionsByClass(classId: number | null | undefined) {
  return useQuery({
    queryKey: typeof classId === "number" ? schoolKeys.sections.listByClass(classId) : [...schoolKeys.sections.root(), "by-class", "nil"],
    queryFn: () => SchoolSectionsService.listByClass(classId as number),
    enabled: typeof classId === "number" && classId > 0,
    staleTime: 0, // ✅ FIX: Always consider data stale to ensure refetch after mutations
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: true, // Always refetch on mount if data is stale
    select: (data: any) => (Array.isArray(data) ? data : data.data || []),
  });
}

export function useCreateSchoolSection(classId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolSectionCreate) => SchoolSectionsService.create(classId, payload),
    onSuccess: async () => {
      // ✅ FIX: Ensure cache invalidation and refetch for immediate UI update
      const queryKey = schoolKeys.sections.listByClass(classId);
      qc.invalidateQueries({ queryKey, exact: false });
      qc.invalidateQueries({ queryKey: schoolKeys.enrollments.academicTotal(), exact: false });
      qc.invalidateQueries({ queryKey: ["school-dropdowns", "sections", classId], exact: false });
      
      // Force refetch and wait for completion
      try {
        await qc.refetchQueries({ queryKey, type: 'active' });
      } catch (error) {
        console.error('Error refetching sections after create:', error);
      }
    },
  }, "Section created successfully");
}

export function useUpdateSchoolSection(classId: number, sectionId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolSectionUpdate) => SchoolSectionsService.update(classId, sectionId, payload),
    onSuccess: async () => {
      // ✅ FIX: Ensure cache invalidation and refetch for immediate UI update
      const queryKey = schoolKeys.sections.listByClass(classId);
      qc.invalidateQueries({ queryKey: schoolKeys.sections.detail(classId, sectionId), exact: false });
      qc.invalidateQueries({ queryKey, exact: false });
      qc.invalidateQueries({ queryKey: schoolKeys.enrollments.academicTotal(), exact: false });
      qc.invalidateQueries({ queryKey: ["school-dropdowns", "sections", classId], exact: false });
      
      // Force refetch and wait for completion
      try {
        await qc.refetchQueries({ queryKey, type: 'active' });
      } catch (error) {
        console.error('Error refetching sections after update:', error);
      }
    },
  }, "Section updated successfully");
}

export function useDeleteSchoolSection(classId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (sectionId: number) => SchoolSectionsService.delete(classId, sectionId),
    onSuccess: async () => {
      // ✅ FIX: Clear cache and force refetch to ensure UI updates immediately
      const queryKey = schoolKeys.sections.listByClass(classId);
      
      // Step 1: Remove query from cache to force fresh fetch (non-blocking)
      qc.removeQueries({ queryKey, exact: false });
      
      // Step 2: Invalidate related queries (non-blocking)
      qc.invalidateQueries({ queryKey, exact: false });
      qc.invalidateQueries({ queryKey: schoolKeys.enrollments.academicTotal(), exact: false });
      qc.invalidateQueries({ queryKey: ["school-dropdowns", "sections", classId], exact: false });
      
      // Step 3: Force refetch and wait for completion to ensure UI updates
      try {
        await qc.refetchQueries({ queryKey, type: 'active' });
      } catch (error) {
        console.error('Error refetching sections after delete:', error);
      }
    },
  }, "Section deleted successfully");
}


