import { Api } from "@/core/api";
import {
  CollegeEnrollmentCreate,
  CollegeEnrollmentsPaginatedResponse,
  CollegeEnrollmentWithStudentDetails,
  CollegeEnrollmentsAcademicTotalResponse,
} from "@/features/college/types";

export interface CollegeEnrollmentsListParams {
  class_id: number;
  group_id: number;
  page?: number;
  pageSize?: number;
  course_id?: number;
  /** Full-text search. Optional. */
  search?: string | null;
}

export const CollegeEnrollmentsService = {
  // GET /api/v1/college/student-enrollments/dashboard/academic-total
  getAcademicTotal(): Promise<CollegeEnrollmentsAcademicTotalResponse> {
    return Api.get<CollegeEnrollmentsAcademicTotalResponse>(`/college/student-enrollments/dashboard/academic-total`);
  },

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
  getPromotionEligibility(params?: { search?: string | null }): Promise<import("../types/promotion").CollegePromotionEligibilityResponse> {
    const qs = new URLSearchParams();
    if (params?.search != null && params.search.trim() !== "") qs.append("search", params.search.trim());
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return Api.get<import("../types/promotion").CollegePromotionEligibilityResponse>(`/college/student-enrollments/promotion-eligibility${suffix}`);
  },

  // POST /api/v1/college/student-enrollments/promote
  promote(payload: import("../types/promotion").PromotionRequest): Promise<import("../types/promotion").PromotionResponse> {
    return Api.post<import("../types/promotion").PromotionResponse>(`/college/student-enrollments/promote`, payload);
  },

  // POST /api/v1/college/student-enrollments/dropout
  dropout(payload: import("../types/promotion").DropoutRequest): Promise<import("../types/promotion").DropoutResponse> {
    return Api.post<import("../types/promotion").DropoutResponse>(`/college/student-enrollments/dropout`, payload);
  },

  // GET /api/v1/college/student-enrollments/promoted-students (paginated, optional search)
  getPromotedStudents(params?: { page?: number; page_size?: number; academic_year_id?: number | null; search?: string | null }): Promise<import("../types/promotion").CollegePromotedStudentsResponse> {
    const qs = new URLSearchParams();
    if (params?.page != null) qs.append("page", String(params.page));
    if (params?.page_size != null) qs.append("page_size", String(params.page_size));
    if (params?.academic_year_id != null) qs.append("academic_year_id", String(params.academic_year_id));
    if (params?.search != null && params.search.trim() !== "") qs.append("search", params.search.trim());
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return Api.get<import("../types/promotion").CollegePromotedStudentsResponse>(`/college/student-enrollments/promoted-students${suffix}`);
  },

  // GET /api/v1/college/student-enrollments/dropped-out-students (paginated, optional search)
  getDroppedOutStudents(params?: { page?: number; page_size?: number; search?: string | null }): Promise<import("../types/promotion").CollegeDroppedOutStudentsResponse> {
    const qs = new URLSearchParams();
    if (params?.page != null) qs.append("page", String(params.page));
    if (params?.page_size != null) qs.append("page_size", String(params.page_size));
    if (params?.search != null && params.search.trim() !== "") qs.append("search", params.search.trim());
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return Api.get<import("../types/promotion").CollegeDroppedOutStudentsResponse>(`/college/student-enrollments/dropped-out-students${suffix}`);
  },
};
