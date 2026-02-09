import { Api } from "@/core/api";
import type {
  SchoolEnrollmentCreate,
  SchoolEnrollmentWithStudentDetails,
  SchoolEnrollmentsPaginatedResponse,
  SchoolEnrollmentFilterParams,
  SchoolEnrollmentForSectionAssignment,
  AssignSectionsRequest,
  AssignSectionsResponse,
  GenerateRollNumbersResponse,
  ChangeEnrollmentSectionResponse,
  SchoolEnrollmentsAcademicTotalResponse,
} from "@/features/school/types/enrollments";

export const EnrollmentsService = {
  // GET /api/v1/school/enrollments/dashboard/academic-total
  getAcademicTotal(): Promise<SchoolEnrollmentsAcademicTotalResponse> {
    return Api.get<SchoolEnrollmentsAcademicTotalResponse>(`/school/enrollments/dashboard/academic-total`);
  },

  // GET /api/v1/school/enrollments/
  list(params: { class_id: number } & SchoolEnrollmentFilterParams & { admission_no?: string; search?: string | null }): Promise<SchoolEnrollmentsPaginatedResponse> {
    const { class_id, section_id, admission_no, page, page_size, search } = params;
    const qs = new URLSearchParams();
    qs.append("class_id", String(class_id));
    if (section_id != null) qs.append("section_id", String(section_id));
    if (admission_no) qs.append("admission_no", String(admission_no));
    if (page != null) qs.append("page", String(page));
    if (page_size != null) qs.append("page_size", String(page_size));
    if (search != null && search.trim() !== "") qs.append("search", search.trim());
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

  // POST /api/v1/school/enrollments/generate-roll-numbers?class_id={class_id}
  generateRollNumbers(class_id: number): Promise<GenerateRollNumbersResponse> {
    return Api.post<GenerateRollNumbersResponse>(`/school/enrollments/generate-roll-numbers?class_id=${class_id}`);
  },

  // POST /api/v1/school/enrollments/assign-sections
  assignSections(payload: AssignSectionsRequest): Promise<AssignSectionsResponse> {
    return Api.post<AssignSectionsResponse>(`/school/enrollments/assign-sections`, payload);
  },

  // PATCH /api/v1/school/enrollments/{enrollment_id}/section/{section_id} - change section (no body, roll number unchanged)
  changeEnrollmentSection(enrollment_id: number, section_id: number): Promise<ChangeEnrollmentSectionResponse> {
    return Api.patch<ChangeEnrollmentSectionResponse>(`/school/enrollments/${enrollment_id}/section/${section_id}`);
  },

  // GET /api/v1/school/enrollments/promotion-eligibility
  getPromotionEligibility(params?: { search?: string | null }): Promise<import("../types/promotion").SchoolPromotionEligibilityResponse> {
    const qs = new URLSearchParams();
    if (params?.search != null && params.search.trim() !== "") qs.append("search", params.search.trim());
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return Api.get<import("../types/promotion").SchoolPromotionEligibilityResponse>(`/school/enrollments/promotion-eligibility${suffix}`);
  },

  // POST /api/v1/school/enrollments/promote
  promote(payload: import("../types/promotion").PromotionRequest): Promise<import("../types/promotion").PromotionResponse> {
    return Api.post<import("../types/promotion").PromotionResponse>(`/school/enrollments/promote`, payload);
  },

  // POST /api/v1/school/enrollments/dropout
  dropout(payload: import("../types/promotion").DropoutRequest): Promise<import("../types/promotion").DropoutResponse> {
    return Api.post<import("../types/promotion").DropoutResponse>(`/school/enrollments/dropout`, payload);
  },

  // GET /api/v1/school/enrollments/promoted-students (paginated, optional search)
  getPromotedStudents(params?: { page?: number; page_size?: number; academic_year_id?: number | null; search?: string | null }): Promise<import("../types/promotion").SchoolPromotedStudentsResponse> {
    const qs = new URLSearchParams();
    if (params?.page != null) qs.append("page", String(params.page));
    if (params?.page_size != null) qs.append("page_size", String(params.page_size));
    if (params?.academic_year_id != null) qs.append("academic_year_id", String(params.academic_year_id));
    if (params?.search != null && params.search.trim() !== "") qs.append("search", params.search.trim());
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return Api.get<import("../types/promotion").SchoolPromotedStudentsResponse>(`/school/enrollments/promoted-students${suffix}`);
  },

  // GET /api/v1/school/enrollments/dropped-out-students (paginated, optional search)
  getDroppedOutStudents(params?: { page?: number; page_size?: number; search?: string | null }): Promise<import("../types/promotion").SchoolDroppedOutStudentsResponse> {
    const qs = new URLSearchParams();
    if (params?.page != null) qs.append("page", String(params.page));
    if (params?.page_size != null) qs.append("page_size", String(params.page_size));
    if (params?.search != null && params.search.trim() !== "") qs.append("search", params.search.trim());
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return Api.get<import("../types/promotion").SchoolDroppedOutStudentsResponse>(`/school/enrollments/dropped-out-students${suffix}`);
  },
};
