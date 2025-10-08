import { Api } from "@/lib/api";
import type {
  EnrollmentCreate,
  EnrollmentUpdate,
  EnrollmentWithStudentDetails,
  EnrollmentsPaginatedResponse,
  EnrollmentFilterParams,
} from "@/lib/types/school";

export const EnrollmentsService = {
  // GET /api/v1/school/enrollments/
  list(params: { class_id: number } & EnrollmentFilterParams): Promise<EnrollmentsPaginatedResponse> {
    const { class_id, section_id, admission_no, page, page_size } = params;
    const qs = new URLSearchParams();
    qs.append("class_id", String(class_id));
    if (section_id != null) qs.append("section_id", String(section_id));
    if (admission_no) qs.append("admission_no", String(admission_no));
    if (page != null) qs.append("page", String(page));
    if (page_size != null) qs.append("page_size", String(page_size));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return Api.get<EnrollmentsPaginatedResponse>(`/school/enrollments/${suffix}`);
  },

  // GET /api/v1/school/enrollments/{enrollment_id}
  getById(enrollment_id: number): Promise<EnrollmentWithStudentDetails> {
    return Api.get<EnrollmentWithStudentDetails>(`/school/enrollments/${enrollment_id}`);
  },

  // GET /api/v1/school/enrollments/by-admission/{admission_no}
  getByAdmission(admission_no: string): Promise<EnrollmentWithStudentDetails[]> {
    return Api.get<EnrollmentWithStudentDetails[]>(`/school/enrollments/by-admission/${admission_no}`);
  },

  // POST /api/v1/school/enrollments/
  create(payload: EnrollmentCreate): Promise<EnrollmentWithStudentDetails> {
    return Api.post<EnrollmentWithStudentDetails>(`/school/enrollments/`, payload);
  },

  // PUT /api/v1/school/enrollments/{enrollment_id}
  update(enrollment_id: number, payload: EnrollmentUpdate): Promise<EnrollmentWithStudentDetails> {
    return Api.put<EnrollmentWithStudentDetails>(`/school/enrollments/${enrollment_id}`, payload);
  },

  // DELETE /api/v1/school/enrollments/{enrollment_id}
  delete(enrollment_id: number): Promise<void> {
    return Api.delete<void>(`/school/enrollments/${enrollment_id}`);
  },
};


