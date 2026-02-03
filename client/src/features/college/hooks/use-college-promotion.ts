import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeEnrollmentsService } from "@/features/college/services/enrollments.service";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";
import type { 
  PromotionRequest, 
  DropoutRequest 
} from "@/features/college/types";

export function useCollegePromotionEligibility(enabled = true) {
  return useQuery({
    queryKey: collegeKeys.promotion.eligibility(),
    queryFn: () => CollegeEnrollmentsService.getPromotionEligibility(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePromoteCollegeStudents() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: PromotionRequest) => CollegeEnrollmentsService.promote(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.promotion.root() });
      void qc.invalidateQueries({ queryKey: collegeKeys.enrollments.root() });
    },
  }, "Promotion process completed");
}

export function useDropoutCollegeStudent() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: DropoutRequest) => CollegeEnrollmentsService.dropout(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.promotion.root() });
      void qc.invalidateQueries({ queryKey: collegeKeys.enrollments.root() });
      void qc.invalidateQueries({ queryKey: collegeKeys.students.root() });
    },
  }, "Student marked as dropped out");
}
