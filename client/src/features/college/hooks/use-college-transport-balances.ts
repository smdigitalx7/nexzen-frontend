import { useQuery } from "@tanstack/react-query";
import { CollegeTransportBalancesService } from "@/features/college/services/transport-fee-balances.service";
import type {
  CollegeStudentTransportPaymentSummaryParams,
} from "@/features/college/types/index.ts";
import { collegeKeys } from "./query-keys";

export function useCollegeStudentTransportPaymentSummary(params?: CollegeStudentTransportPaymentSummaryParams) {
  // Enable query if params are provided (even if empty object - means filters are selected but only client-side filtering needed)
  const hasParams = params !== undefined && params !== null;
  
  return useQuery({
    queryKey: [...collegeKeys.transport.root(), "payment-summary", params ?? {}],
    queryFn: () => CollegeTransportBalancesService.getStudentTransportPaymentSummary(params),
    enabled: hasParams,
  });
}

export function useCollegeStudentTransportPaymentSummaryByEnrollmentId(enrollment_id: number | null | undefined) {
  return useQuery({
    queryKey: [...collegeKeys.transport.root(), "payment-summary", "by-enrollment", enrollment_id ?? "nil"],
    queryFn: () => {
      if (!enrollment_id || enrollment_id <= 0) {
        throw new Error("Invalid enrollment_id");
      }
      return CollegeTransportBalancesService.getStudentTransportPaymentSummaryByEnrollmentId(enrollment_id);
    },
    enabled: !!enrollment_id && enrollment_id > 0,
  });
}

export function useCollegeExpectedTransportPaymentsByEnrollmentId(enrollment_id: number | null | undefined) {
  return useQuery({
    queryKey: [...collegeKeys.transport.root(), "expected-payments", enrollment_id ?? "nil"],
    queryFn: () => {
      if (!enrollment_id || enrollment_id <= 0) {
        throw new Error("Invalid enrollment_id");
      }
      return CollegeTransportBalancesService.getExpectedTransportPaymentsByEnrollmentId(enrollment_id);
    },
    enabled: !!enrollment_id && enrollment_id > 0,
  });
}
