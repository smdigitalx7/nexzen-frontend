import { Api } from "@/core/api";
import type {
  SchoolEnrollmentCreate,
  SchoolEnrollmentWithStudentDetails,
  SchoolEnrollmentsPaginatedResponse,
  SchoolEnrollmentFilterParams,
  SchoolEnrollmentForSectionAssignment,
  AssignSectionsRequest,
  ChangeEnrollmentSectionRequest,
} from "@/features/school/types/enrollments";

export const EnrollmentsService = {
  // GET /api/v1/school/enrollments/
  list(params: { class_id: number } & SchoolEnrollmentFilterParams & { admission_no?: string }): Promise<SchoolEnrollmentsPaginatedResponse> {
    const { class_id, section_id, admission_no, page, page_size } = params;
    const qs = new URLSearchParams();
    qs.append("class_id", String(class_id));
    if (section_id != null) qs.append("section_id", String(section_id));
    if (admission_no) qs.append("admission_no", String(admission_no));
    if (page != null) qs.append("page", String(page));
    if (page_size != null) qs.append("page_size", String(page_size));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return Api.get<SchoolEnrollmentsPaginatedResponse>(`/school/enrollments${suffix}`);
  },

  // GET /api/v1/school/enrollments/{enrollment_id}
  getById(enrollment_id: number): Promise<SchoolEnrollmentWithStudentDetails> {
    return Api.get<SchoolEnrollmentWithStudentDetails>(`/school/enrollments/${enrollment_id}`);
  },

  // GET /api/v1/school/enrollments/by-admission/{admission_no}
  getByAdmission(admission_no: string): Promise<SchoolEnrollmentWithStudentDetails> {
    return Api.get<SchoolEnrollmentWithStudentDetails>(`/school/enrollments/by-admission/${admission_no}`);
  },

  // POST /api/v1/school/enrollments/
  create(payload: SchoolEnrollmentCreate): Promise<SchoolEnrollmentWithStudentDetails> {
    return Api.post<SchoolEnrollmentWithStudentDetails>(`/school/enrollments`, payload);
  },

  // GET /api/v1/school/enrollments/for-section-assignment
  getForSectionAssignment(class_id: number): Promise<SchoolEnrollmentForSectionAssignment[]> {
    return Api.get<SchoolEnrollmentForSectionAssignment[]>(`/school/enrollments/for-section-assignment?class_id=${class_id}`);
  },

  // PUT /api/v1/school/enrollments/assign-sections
  assignSections(payload: AssignSectionsRequest): Promise<void> {
    return Api.put<void>(`/school/enrollments/assign-sections`, payload);
  },

  // PATCH /api/v1/school/enrollments/{enrollment_id}/section - change section (and optionally roll number) within same class
  changeEnrollmentSection(enrollment_id: number, payload: ChangeEnrollmentSectionRequest): Promise<void> {
    return Api.patch<void>(`/school/enrollments/${enrollment_id}/section`, payload);
  },

  // GET /api/v1/school/enrollments/promotion-eligibility
  getPromotionEligibility(): Promise<import("../types/promotion").SchoolPromotionEligibilityResponse> {
    return Api.get<import("../types/promotion").SchoolPromotionEligibilityResponse>(`/school/enrollments/promotion-eligibility`);
  },

  // POST /api/v1/school/enrollments/promote
  promote(payload: import("../types/promotion").PromotionRequest): Promise<import("../types/promotion").PromotionResponse> {
    return Api.post<import("../types/promotion").PromotionResponse>(`/school/enrollments/promote`, payload);
  },

  // POST /api/v1/school/enrollments/dropout
  dropout(payload: import("../types/promotion").DropoutRequest): Promise<import("../types/promotion").DropoutResponse> {
    return Api.post<import("../types/promotion").DropoutResponse>(`/school/enrollments/dropout`, payload);
  },
};
