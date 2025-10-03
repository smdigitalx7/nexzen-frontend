import { Api } from "@/lib/api";
import type {
  EnrollmentCreate,
  EnrollmentUpdate,
  EnrollmentWithStudentDetails,
  EnrollmentsPaginatedResponse,
  EnrollmentFilterParams,
} from "@/lib/types/school";

export const EnrollmentsService = {
  list(params: { class_id: number } & EnrollmentFilterParams): Promise<EnrollmentsPaginatedResponse> {
    const { class_id, section_id, admission_no } = params;
    const qs = new URLSearchParams();
    if (section_id != null) qs.append("section_id", String(section_id));
    if (admission_no) qs.append("admission_no", String(admission_no));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return Api.get<EnrollmentsPaginatedResponse>(`/school/classes/${class_id}/enrollments/${suffix}`);
  },

  getById(class_id: number, enrollment_id: number): Promise<EnrollmentWithStudentDetails> {
    return Api.get<EnrollmentWithStudentDetails>(`/school/classes/${class_id}/enrollments/${enrollment_id}`);
  },

  create(payload: EnrollmentCreate): Promise<EnrollmentWithStudentDetails> {
    return Api.post<EnrollmentWithStudentDetails>(
      `/school/classes/${payload.class_id}/enrollments/`,
      payload
    );
  },

  update(class_id: number, enrollment_id: number, payload: EnrollmentUpdate): Promise<EnrollmentWithStudentDetails> {
    return Api.put<EnrollmentWithStudentDetails>(`/school/classes/${class_id}/enrollments/${enrollment_id}`, payload);
  },
};


