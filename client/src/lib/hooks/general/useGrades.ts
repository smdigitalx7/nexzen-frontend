import { useQuery, useMutation } from "@tanstack/react-query";
import { GradesService } from "@/lib/services/general/grades.service";
import type {
  GradeRead,
  GradeCreate,
  GradeUpdate,
} from "@/lib/types/general/grades";
import { useGlobalRefetch } from "../common/useGlobalRefetch";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for managing grades
 */
export const useGrades = () => {
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
      toast({
        title: "Success",
        variant: "success",
        description: "Grade created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to create grade",
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
      toast({
        title: "Success",
        variant: "success",
        description: "Grade updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to update grade",
        variant: "destructive",
      });
    },
  });

  // Delete grade mutation
  const deleteGradeMutation = useMutation({
    mutationFn: (gradeCode: string) => GradesService.deleteGrade(gradeCode),
    onSuccess: () => {
      invalidateEntity("grades");
      toast({
        title: "Success",
        variant: "destructive",
        description: "Grade deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to delete grade",
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

