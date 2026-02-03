import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EnrollmentsService } from "@/features/school/services/enrollments.service";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";
import type { 
  PromotionRequest, 
  DropoutRequest 
} from "@/features/school/types";

export function useSchoolPromotionEligibility(enabled = true) {
  return useQuery({
    queryKey: schoolKeys.promotion.eligibility(),
    queryFn: () => EnrollmentsService.getPromotionEligibility(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePromoteSchoolStudents() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: PromotionRequest) => EnrollmentsService.promote(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.promotion.root() });
      void qc.invalidateQueries({ queryKey: schoolKeys.enrollments.root() });
    },
  }, "Promotion process completed");
}

export function useDropoutSchoolStudent() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: DropoutRequest) => EnrollmentsService.dropout(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.promotion.root() });
      void qc.invalidateQueries({ queryKey: schoolKeys.enrollments.root() });
      void qc.invalidateQueries({ queryKey: schoolKeys.students.root() });
    },
  }, "Student marked as dropped out");
}
