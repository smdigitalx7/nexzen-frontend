import { Api } from "@/lib/api";
import {
  CollegeStudentTransportPaymentSummaryListResponse,
  CollegeStudentTransportPaymentSummaryParams,
  CollegeStudentTransportPaymentSummary,
} from "@/lib/types/college";

export const CollegeTransportBalancesService = {
  // GET /api/v1/college/student-transport-payment
  getStudentTransportPaymentSummary(params?: CollegeStudentTransportPaymentSummaryParams) {
    return Api.get<CollegeStudentTransportPaymentSummaryListResponse>(`/college/student-transport-payment`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  // GET /api/v1/college/student-transport-payment/{admission_no}
  getStudentTransportPaymentSummaryByAdmissionNo(admission_no: string) {
    return Api.get<CollegeStudentTransportPaymentSummary>(`/college/student-transport-payment/${admission_no}`);
  },
};