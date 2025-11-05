import { useQuery } from "@tanstack/react-query";
import { CollegeTransportBalancesService } from "@/lib/services/college/transport-fee-balances.service";
import type {
  CollegeStudentTransportPaymentSummaryParams,
} from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";

export function useCollegeStudentTransportPaymentSummary(params?: CollegeStudentTransportPaymentSummaryParams) {
  return useQuery({
    queryKey: [...collegeKeys.transport.root(), "payment-summary", params ?? {}],
    queryFn: () => CollegeTransportBalancesService.getStudentTransportPaymentSummary(params),
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
