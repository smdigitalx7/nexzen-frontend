import { Api } from "@/lib/api";
import {
  CollegeStudentTransportPaymentSummaryListResponse,
  CollegeStudentTransportPaymentSummaryParams,
  CollegeStudentTransportPaymentSummary,
  ExpectedTransportPaymentsResponse,
} from "@/lib/types/college";

export const CollegeTransportBalancesService = {
  // GET /api/v1/college/student-transport-payment
  getStudentTransportPaymentSummary(params?: CollegeStudentTransportPaymentSummaryParams) {
    return Api.get<CollegeStudentTransportPaymentSummaryListResponse>(`/college/student-transport-payment`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  // GET /api/v1/college/student-transport-payment/by-enrollment/{enrollment_id}
  getStudentTransportPaymentSummaryByEnrollmentId(enrollment_id: number, options?: { cache?: boolean }) {
    return Api.get<CollegeStudentTransportPaymentSummary>(
      `/college/student-transport-payment/by-enrollment/${enrollment_id}`,
      undefined,
      undefined,
      options
    );
  },

  // GET /api/v1/college/student-transport-payment/expected-payments/{enrollment_id}
  getExpectedTransportPaymentsByEnrollmentId(enrollment_id: number, options?: { cache?: boolean }) {
    return Api.get<ExpectedTransportPaymentsResponse>(
      `/college/student-transport-payment/expected-payments/${enrollment_id}`,
      undefined,
      undefined,
      options
    );
  },
};