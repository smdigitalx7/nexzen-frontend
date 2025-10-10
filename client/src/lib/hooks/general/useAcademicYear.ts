import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AcademicYearService } from '@/lib/services/general/academic-year.service';
import { AcademicYearCreate, AcademicYearUpdate } from '@/lib/types/general/academic-year';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: AcademicYearCreate) => AcademicYearService.createAcademicYear(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      toast({
        title: "Academic Year Created",
        description: `${data.year_name} has been created successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to create academic year",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateAcademicYear = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AcademicYearUpdate }) => 
      AcademicYearService.updateAcademicYear(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      queryClient.invalidateQueries({ queryKey: ['academic-year', data.academic_year_id] });
      toast({
        title: "Academic Year Updated",
        description: `${data.year_name} has been updated successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to update academic year",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteAcademicYear = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => AcademicYearService.deleteAcademicYear(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      toast({
        title: "Academic Year Deleted",
        description: "Academic year has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to delete academic year",
        variant: "destructive",
      });
    },
  });
};
