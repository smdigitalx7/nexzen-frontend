import { useQuery } from "@tanstack/react-query";
import { AcademicYearService } from '@/features/general/services/academic-year.service';
import { AcademicYearCreate, AcademicYearUpdate } from '@/features/general/types/academic-year';
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";
import { useGlobalRefetch } from "@/common/hooks/useGlobalRefetch";
import { useAuthStore } from "@/core/auth/authStore";

/**
 * ✅ OPTIMIZATION: Made on-demand - academic years are fetched from auth store
 * Only fetch when explicitly needed (e.g., admin academic year management)
 */
export const useAcademicYears = (options?: { enabled?: boolean }) => {
  const { isAuthenticated, isLoggingOut } = useAuthStore();
  
  return useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => {
      // CRITICAL: Double-check logout state INSIDE queryFn (safety net)
      const currentState = useAuthStore.getState();
      if (currentState.isLoggingOut || !currentState.isAuthenticated) {
        throw new Error("Query cancelled: logout in progress");
      }
      return AcademicYearService.listAcademicYears();
    },
    // CRITICAL: Disable query if logging out or not authenticated
    enabled: (options?.enabled !== false) && isAuthenticated && !isLoggingOut,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: !isLoggingOut, // Disable refetch during logout
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
