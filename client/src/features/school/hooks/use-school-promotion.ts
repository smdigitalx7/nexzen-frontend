import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EnrollmentsService } from "@/features/school/services/enrollments.service";
import { schoolKeys } from "./query-keys";
import { useMutationWithToast } from "@/common/hooks/use-mutation-with-toast";
import { useToast } from "@/common/hooks/use-toast";
import type { 
  PromotionRequest, 
  DropoutRequest 
} from "@/features/school/types";

export function useSchoolPromotionEligibility(params?: { search?: string | null; page?: number; page_size?: number }, enabled = true) {
  return useQuery({
    queryKey: schoolKeys.promotion.eligibility(params),
    queryFn: () => EnrollmentsService.getPromotionEligibility(params),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePromoteSchoolStudents() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutationWithToast({
    mutationFn: (payload: PromotionRequest) => EnrollmentsService.promote(payload),
    onSuccess: (data) => {
      if (data.summary.errors > 0) {
        // Try to find a specific error message from results if summary message is null
        const firstErrorMessage = data.results.find(r => !r.success && r.message)?.message;
        
        toast({
          title: data.summary.promoted > 0 ? "Partial Success" : "Promotion Failed",
          description: data.summary.message || firstErrorMessage || `Promotion completed with ${data.summary.errors} error(s).`,
          variant: data.summary.promoted > 0 ? "destructive" : "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: data.summary.message || "Promotion process completed successfully.",
          variant: "success",
        });
      }
      void qc.invalidateQueries({ queryKey: schoolKeys.promotion.root() });
      void qc.invalidateQueries({ queryKey: schoolKeys.enrollments.root() });
    },
  });
}

export function useDropoutSchoolStudent() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutationWithToast({
    mutationFn: (payload: DropoutRequest) => EnrollmentsService.dropout(payload),
    onSuccess: (data) => {
      toast({
        title: data.success ? "Success" : "Dropout Failed",
        description: data.message || (data.success ? "Student marked as dropped out" : "Failed to dropout student"),
        variant: data.success ? "success" : "destructive",
      });
      if (data.success) {
        void qc.invalidateQueries({ queryKey: schoolKeys.promotion.root() });
        void qc.invalidateQueries({ queryKey: schoolKeys.enrollments.root() });
        void qc.invalidateQueries({ queryKey: schoolKeys.students.root() });
      }
    },
  });
}
