import { useQuery } from "@tanstack/react-query";
import { EnrollmentsService } from "@/features/school/services/enrollments.service";
import { SchoolTuitionFeeBalancesService } from "@/features/school/services/tuition-fee-balances.service";
import { SchoolTransportFeeBalancesService } from "@/features/school/services/transport-fee-balances.service";
import { schoolKeys } from "./query-keys";
import type { SchoolEnrollmentWithStudentDetails } from "@/features/school/types/enrollments";

export interface StudentFeeDetails {
  enrollment: SchoolEnrollmentWithStudentDetails;
  tuitionBalance: any;
  transportBalance: any;
}

export const useStudentFeeDetails = (admissionNo: string | null) => {
  // 1. Fetch Enrollment Details
  const enrollmentQuery = useQuery({
    queryKey: schoolKeys.students.byAdmission(admissionNo || ""),
    queryFn: () => EnrollmentsService.getByAdmission(admissionNo!),
    enabled: !!admissionNo,
    retry: false,
  });

  const enrollment = enrollmentQuery.data;
  const enrollmentId = enrollment?.enrollment_id;

  // 2. Fetch Tuition Balance (Dependent on Enrollment)
  const tuitionQuery = useQuery({
    queryKey: schoolKeys.tuition.detail(enrollmentId || 0),
    queryFn: () => SchoolTuitionFeeBalancesService.getById(enrollmentId!),
    enabled: !!enrollmentId,
  });

  // 3. Fetch Transport Balance (Dependent on Enrollment)
  const transportQuery = useQuery({
    queryKey: schoolKeys.transport.detail(enrollmentId || 0),
    queryFn: () => SchoolTransportFeeBalancesService.getById(enrollmentId!),
    enabled: !!enrollmentId,
  });

  const isLoading = enrollmentQuery.isLoading || tuitionQuery.isLoading || transportQuery.isLoading;
  const isError = enrollmentQuery.isError || tuitionQuery.isError || transportQuery.isError;
  
  // Combined Data
  const data: StudentFeeDetails | null = enrollment && tuitionQuery.data && transportQuery.data ? {
      enrollment: enrollment,
      tuitionBalance: tuitionQuery.data,
      transportBalance: transportQuery.data
  } : null;

  return {
    data,
    isLoading,
    isError,
    error: enrollmentQuery.error || tuitionQuery.error || transportQuery.error,
    refetch: async () => {
        await enrollmentQuery.refetch();
        if (enrollmentId) {
            await Promise.all([tuitionQuery.refetch(), transportQuery.refetch()]);
        }
    }
  };
};
