import { useQuery, useMutation } from "@tanstack/react-query";
import { GradesService } from "@/features/general/services/grades.service";
import type {
  GradeRead,
  GradeCreate,
  GradeUpdate,
} from "@/features/general/types/grades";
import { useGlobalRefetch } from "@/common/hooks/useGlobalRefetch";
import { useToast } from "@/common/hooks/use-toast";

/**
 * Hook for managing grades
 * ✅ OPTIMIZATION: Supports enabled option for on-demand fetching
 */
export const useGrades = (options?: { enabled?: boolean }) => {
  const { invalidateEntity } = useGlobalRefetch();
  const { toast } = useToast();

  // Get all grades
  const {
    data: grades,
    isLoading: isLoadingGrades,
    error: gradesError,
    refetch: refetchGrades,
  } = useQuery({
    queryKey: ["grades"],
    queryFn: () => GradesService.listGrades(),
    enabled: options?.enabled !== false, // Default to true, but allow disabling
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });

  // Get grade by code
  const useGradeByCode = (gradeCode: string) => {
    return useQuery({
      queryKey: ["grades", gradeCode],
      queryFn: () => GradesService.getGradeByCode(gradeCode),
      enabled: !!gradeCode,
    });
  };

  // Create grade mutation
  const createGradeMutation = useMutation({
    mutationFn: (data: GradeCreate) => GradesService.createGrade(data),
    onSuccess: () => {
      invalidateEntity("grades");
      invalidateEntity("academicTotal");
      toast({
        title: "Success",
        variant: "success",
        description: "Grade created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create grade",
        variant: "destructive",
      });
    },
  });

  // Update grade mutation
  const updateGradeMutation = useMutation({
    mutationFn: ({ gradeCode, data }: { gradeCode: string; data: GradeUpdate }) =>
      GradesService.updateGrade(gradeCode, data),
    onSuccess: () => {
      invalidateEntity("grades");
      invalidateEntity("academicTotal");
      toast({
        title: "Success",
        variant: "success",
        description: "Grade updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update grade",
        variant: "destructive",
      });
    },
  });

  // Delete grade mutation
  const deleteGradeMutation = useMutation({
    mutationFn: (gradeCode: string) => GradesService.deleteGrade(gradeCode),
    onSuccess: () => {
      invalidateEntity("grades");
      invalidateEntity("academicTotal");
      toast({
        title: "Success",
        variant: "destructive",
        description: "Grade deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete grade",
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    grades: grades || [],
    isLoadingGrades,
    gradesError,
    refetchGrades,
    // Hooks
    useGradeByCode,
    // Mutations
    createGrade: createGradeMutation,
    updateGrade: updateGradeMutation,
    deleteGrade: deleteGradeMutation,
  };
};

