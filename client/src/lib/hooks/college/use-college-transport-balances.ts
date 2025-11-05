import { useQuery } from "@tanstack/react-query";
import { CollegeTransportBalancesService } from "@/lib/services/college/transport-fee-balances.service";
import type {
  CollegeStudentTransportPaymentSummaryListResponse,
  CollegeStudentTransportPaymentSummaryParams,
  CollegeStudentTransportPaymentSummary,
} from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";

export function useCollegeStudentTransportPaymentSummary(params?: CollegeStudentTransportPaymentSummaryParams) {
  return useQuery({
    queryKey: [...collegeKeys.transport.root(), "payment-summary", params ?? {}],
    queryFn: () => CollegeTransportBalancesService.getStudentTransportPaymentSummary(params),
  });
}

export function useCollegeStudentTransportPaymentSummaryByAdmissionNo(admission_no: string | null | undefined) {
  return useQuery({
    queryKey: [...collegeKeys.transport.root(), "payment-summary", "by-admission", admission_no ?? "nil"],
    queryFn: () => CollegeTransportBalancesService.getStudentTransportPaymentSummaryByAdmissionNo(admission_no!),
    enabled: !!admission_no && admission_no.length > 0,
  });
}
