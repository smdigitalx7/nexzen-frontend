import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AcademicYearService } from '@/lib/services/general/academic-year.service';
import { AcademicYearCreate, AcademicYearUpdate } from '@/lib/types/general/academic-year';
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export const useAcademicYears = () => {
  return useQuery({
    queryKey: ['academic-years'],
    queryFn: () => AcademicYearService.listAcademicYears(),
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
  const queryClient = useQueryClient();

  return useMutationWithSuccessToast({
    mutationFn: (data: AcademicYearCreate) => AcademicYearService.createAcademicYear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
    },
  }, "Academic year created successfully");
};

export const useUpdateAcademicYear = () => {
  const queryClient = useQueryClient();

  return useMutationWithSuccessToast({
    mutationFn: ({ id, data }: { id: number; data: AcademicYearUpdate }) => 
      AcademicYearService.updateAcademicYear(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      queryClient.invalidateQueries({ queryKey: ['academic-year', data.academic_year_id] });
    },
  }, "Academic year updated successfully");
};

export const useDeleteAcademicYear = () => {
  const queryClient = useQueryClient();

  return useMutationWithSuccessToast({
    mutationFn: (id: number) => AcademicYearService.deleteAcademicYear(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
    },
  }, "Academic year deleted successfully");
};
