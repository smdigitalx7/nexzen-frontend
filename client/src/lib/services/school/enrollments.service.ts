import { Api } from "@/lib/api";
import type {
  SchoolEnrollmentCreate,
  SchoolEnrollmentWithStudentDetails,
  SchoolEnrollmentsPaginatedResponse,
  SchoolEnrollmentFilterParams,
} from "@/lib/types/school/enrollments";

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
};


