import { Api } from "@/core/api";
import { CollegeEnrollmentCreate, CollegeEnrollmentsPaginatedResponse, CollegeEnrollmentWithStudentDetails } from "@/features/college/types";

export interface CollegeEnrollmentsListParams {
  class_id: number; // Required
  group_id: number; // Required
  page?: number;
  pageSize?: number;
  course_id?: number;
}

export const CollegeEnrollmentsService = {
  list(params: CollegeEnrollmentsListParams) {
    return Api.get<CollegeEnrollmentsPaginatedResponse>(
      `/college/student-enrollments`,
      params as unknown as Record<string, string | number | boolean | null | undefined> | undefined
    );
  },

  getById(enrollment_id: number) {
    return Api.get<CollegeEnrollmentWithStudentDetails>(`/college/student-enrollments/${enrollment_id}`);
  },

  getByAdmission(admission_no: string, options?: { cache?: boolean }) {
    return Api.get<CollegeEnrollmentWithStudentDetails>(
      `/college/student-enrollments/by-admission/${admission_no}`,
      undefined,
      undefined,
      options as any
    );
  },

  create(payload: CollegeEnrollmentCreate) {
    return Api.post<CollegeEnrollmentWithStudentDetails>(`/college/student-enrollments`, payload);
  },

  // GET /api/v1/college/student-enrollments/promotion-eligibility
  getPromotionEligibility(): Promise<import("../types/promotion").CollegePromotionEligibilityResponse> {
    return Api.get<import("../types/promotion").CollegePromotionEligibilityResponse>(`/college/student-enrollments/promotion-eligibility`);
  },

  // POST /api/v1/college/student-enrollments/promote
  promote(payload: import("../types/promotion").PromotionRequest): Promise<import("../types/promotion").PromotionResponse> {
    return Api.post<import("../types/promotion").PromotionResponse>(`/college/student-enrollments/promote`, payload);
  },

  // POST /api/v1/college/student-enrollments/dropout
  dropout(payload: import("../types/promotion").DropoutRequest): Promise<import("../types/promotion").DropoutResponse> {
    return Api.post<import("../types/promotion").DropoutResponse>(`/college/student-enrollments/dropout`, payload);
  },
};
