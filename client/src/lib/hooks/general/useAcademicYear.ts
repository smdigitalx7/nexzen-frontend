import { useQuery } from "@tanstack/react-query";
import { AcademicYearService } from '@/lib/services/general/academic-year.service';
import { AcademicYearCreate, AcademicYearUpdate } from '@/lib/types/general/academic-year';
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";
import { useGlobalRefetch } from "../common/useGlobalRefetch";

/**
 * ✅ OPTIMIZATION: Made on-demand - academic years are fetched from auth store
 * Only fetch when explicitly needed (e.g., admin academic year management)
 */
export const useAcademicYears = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['academic-years'],
    queryFn: () => AcademicYearService.listAcademicYears(),
    enabled: options?.enabled !== false, // ✅ Allow enabling when tab is active
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true, // Refetch on mount if enabled and data is stale
  });
};

export const useAcademicYear = (id: number) => {
  return useQuery({
    queryKey: ['academic-year', id],
    queryFn: () => AcademicYearService.getAcademicYear(id),
    enabled: !!id,
  });
};

export const useCreateAcademicYear = () => {
  const { invalidateEntity } = useGlobalRefetch();

  return useMutationWithSuccessToast({
    mutationFn: (data: AcademicYearCreate) => AcademicYearService.createAcademicYear(data),
    onSuccess: () => {
      invalidateEntity("academicYears");
    },
  }, "Academic year created successfully");
};

export const useUpdateAcademicYear = () => {
  const { invalidateEntity } = useGlobalRefetch();

  return useMutationWithSuccessToast({
    mutationFn: ({ id, data }: { id: number; data: AcademicYearUpdate }) => 
      AcademicYearService.updateAcademicYear(id, data),
    onSuccess: () => {
      invalidateEntity("academicYears");
    },
  }, "Academic year updated successfully");
};

export const useDeleteAcademicYear = () => {
  const { invalidateEntity } = useGlobalRefetch();

  return useMutationWithSuccessToast({
    mutationFn: (id: number) => AcademicYearService.deleteAcademicYear(id),
    onSuccess: () => {
      invalidateEntity("academicYears");
    },
  }, "Academic year deleted successfully");
};
