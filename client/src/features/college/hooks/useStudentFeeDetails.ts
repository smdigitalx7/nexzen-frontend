import { useQuery } from "@tanstack/react-query";
import { CollegeEnrollmentsService } from "@/features/college/services/enrollments.service";
import { CollegeTuitionBalancesService } from "@/features/college/services";
import { CollegeTransportBalancesService } from "@/features/college/services/transport-fee-balances.service";
import { collegeKeys } from "./query-keys";
import type { CollegeEnrollmentWithStudentDetails } from "@/features/college/types/enrollments";
import type { CollegeTuitionFeeBalanceRead } from "@/features/college/types/tuition-fee-balances";
import type {
  CollegeStudentTransportPaymentSummary,
  ExpectedTransportPaymentsResponse,
} from "@/features/college/types/transport-fee-balances";

export interface StudentFeeDetails {
  enrollment: CollegeEnrollmentWithStudentDetails;
  tuitionBalance: CollegeTuitionFeeBalanceRead | null;
  transportBalance?: CollegeStudentTransportPaymentSummary | null;
  transportExpectedPayments?: ExpectedTransportPaymentsResponse;
  transportSummary?: CollegeStudentTransportPaymentSummary | null;
}

export const useStudentFeeDetails = (admissionNo: string | null) => {
  const enrollmentQuery = useQuery({
    queryKey: collegeKeys.enrollments.byAdmission(admissionNo ?? ""),
    queryFn: () => CollegeEnrollmentsService.getByAdmission(admissionNo!),
    enabled: !!admissionNo,
    retry: false,
  });

  const enrollment = enrollmentQuery.data;
  const enrollmentId = enrollment?.enrollment_id;

  const tuitionQuery = useQuery({
    queryKey: collegeKeys.tuition.detail(enrollmentId ?? 0),
    queryFn: () => CollegeTuitionBalancesService.getById(enrollmentId!),
    enabled: !!enrollmentId,
  });

  const transportSummaryQuery = useQuery({
    queryKey: collegeKeys.transport.summaryByEnrollment(enrollmentId ?? 0),
    queryFn: () =>
      CollegeTransportBalancesService.getStudentTransportPaymentSummaryByEnrollmentId(
        enrollmentId!
      ),
    enabled: !!enrollmentId,
  });

  const transportExpectedQuery = useQuery({
    queryKey: collegeKeys.transport.expectedByEnrollment(enrollmentId ?? 0),
    queryFn: () =>
      CollegeTransportBalancesService.getExpectedTransportPaymentsByEnrollmentId(
        enrollmentId!
      ),
    enabled: !!enrollmentId,
  });

  const isLoading =
    enrollmentQuery.isLoading ||
    tuitionQuery.isLoading ||
    transportSummaryQuery.isLoading ||
    transportExpectedQuery.isLoading;
  const isError =
    enrollmentQuery.isError ||
    tuitionQuery.isError ||
    transportSummaryQuery.isError ||
    transportExpectedQuery.isError;

  const data: StudentFeeDetails | null =
    enrollment &&
    !tuitionQuery.isLoading &&
    !transportSummaryQuery.isLoading &&
    !transportExpectedQuery.isLoading
      ? {
          enrollment,
          tuitionBalance: tuitionQuery.data ?? null,
          transportSummary: transportSummaryQuery.data ?? null,
          transportExpectedPayments: transportExpectedQuery.data,
          transportBalance: transportSummaryQuery.data ?? null,
        }
      : null;

  return {
    data,
    isLoading,
    isError,
    error:
      enrollmentQuery.error ||
      tuitionQuery.error ||
      transportSummaryQuery.error ||
      transportExpectedQuery.error,
    refetch: async () => {
      await enrollmentQuery.refetch();
      if (enrollmentId) {
        await Promise.all([
          tuitionQuery.refetch(),
          transportSummaryQuery.refetch(),
          transportExpectedQuery.refetch(),
        ]);
      }
    },
  };
};
