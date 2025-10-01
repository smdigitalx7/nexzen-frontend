import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ServiceLocator } from "@/core";
import { AcademicYearCreate, AcademicYearUpdate } from '../types/academic-year';
import { useToast } from '@/hooks/use-toast';

export const useAcademicYears = () => {
  return useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => {
      try {
        // Try clean architecture first
        const academicYearUseCases = ServiceLocator.getAcademicYearUseCases();
        const academicYears = await academicYearUseCases.getAllAcademicYears();
        
        // Convert clean architecture response to match backend fields exactly
        const mappedYears = academicYears.map(academicYear => ({
          academic_year_id: academicYear.id,
          year_name: academicYear.yearName,
          start_date: academicYear.startDate.split('T')[0],
          end_date: academicYear.endDate.split('T')[0],
          is_active: academicYear.status === 'ACTIVE',
          created_at: academicYear.createdAt,
          updated_at: academicYear.updatedAt,
          created_by: null, // Backend field
          updated_by: null, // Backend field
        }));
        return mappedYears;
      } catch (error) {
        // Fallback to direct API call
        const api = ServiceLocator.getApiClient();
        const res = await api.get<any>('/academic-years/');
        
        // Return the data directly from API
        return res.data || [];
      }
    },
  });
};

export const useAcademicYear = (id: number) => {
  return useQuery({
    queryKey: ['academic-year', id],
    queryFn: async () => {
      const academicYearUseCases = ServiceLocator.getAcademicYearUseCases();
      const academicYear = await academicYearUseCases.getAcademicYearById(id);
      
      if (!academicYear) {
        throw new Error('Academic year not found');
      }
      
      // Convert clean architecture response to match backend fields exactly
      return {
        academic_year_id: academicYear.id,
        year_name: academicYear.yearName,
        start_date: academicYear.startDate.split('T')[0],
        end_date: academicYear.endDate.split('T')[0],
        is_active: academicYear.status === 'ACTIVE',
        created_at: academicYear.createdAt,
        updated_at: academicYear.updatedAt,
        created_by: null,
        updated_by: null,
      };
    },
    enabled: !!id,
  });
};

export const useCreateAcademicYear = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: AcademicYearCreate) => {
      const academicYearUseCases = ServiceLocator.getAcademicYearUseCases();
      const academicYear = await academicYearUseCases.createAcademicYear({
        yearName: data.year_name,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        status: 'ACTIVE' as any,
        isCurrent: data.is_active || false,
        description: undefined,
        branchId: 1, // Default branch
      });
      
      // Convert clean architecture response to legacy format
      return {
        academic_year_id: academicYear.id,
        year_name: academicYear.yearName,
        start_date: academicYear.startDate.split('T')[0],
        end_date: academicYear.endDate.split('T')[0],
        is_active: academicYear.status === 'ACTIVE',
        created_by: null,
        updated_by: null,
        created_at: academicYear.createdAt,
        updated_at: academicYear.updatedAt,
      };
    },
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
    mutationFn: async ({ id, data }: { id: number; data: AcademicYearUpdate }) => {
      const academicYearUseCases = ServiceLocator.getAcademicYearUseCases();
      const academicYear = await academicYearUseCases.updateAcademicYear({
        id,
        yearName: data.year_name,
        startDate: data.start_date ? new Date(data.start_date) : undefined,
        endDate: data.end_date ? new Date(data.end_date) : undefined,
        status: 'ACTIVE' as any,
        isCurrent: data.is_active,
        description: undefined,
      });
      
      // Convert clean architecture response to legacy format
      return {
        academic_year_id: academicYear.id,
        year_name: academicYear.yearName,
        start_date: academicYear.startDate.split('T')[0],
        end_date: academicYear.endDate.split('T')[0],
        is_active: academicYear.status === 'ACTIVE',
        created_by: null,
        updated_by: null,
        created_at: academicYear.createdAt,
        updated_at: academicYear.updatedAt,
      };
    },
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
    mutationFn: async (id: number) => {
      const academicYearUseCases = ServiceLocator.getAcademicYearUseCases();
      await academicYearUseCases.deleteAcademicYear(id);
      
      // Return mock response for compatibility
      return {
        academic_year_id: id,
        year_name: 'Deleted Year',
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: null,
        updated_by: null,
      };
    },
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
