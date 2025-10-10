import { Api } from "@/lib/api";
import { CollegeEnrollmentCreate, CollegeEnrollmentUpdate, CollegeEnrollmentsPaginatedResponse, CollegeEnrollmentWithStudentDetails } from "@/lib/types/college";

export interface CollegeEnrollmentsListParams {
  page?: number;
  pageSize?: number;
  class_id?: number;
  group_id?: number;
  course_id?: number;
}

export const CollegeEnrollmentsService = {
  list(params?: CollegeEnrollmentsListParams) {
    return Api.get<CollegeEnrollmentsPaginatedResponse>(`/college/student-enrollments`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  getById(enrollment_id: number) {
    return Api.get<CollegeEnrollmentWithStudentDetails>(`/college/student-enrollments/${enrollment_id}`);
  },

  getByAdmission(admission_no: string) {
    return Api.get<CollegeEnrollmentWithStudentDetails>(`/college/student-enrollments/by-admission/${admission_no}`);
  },

  create(payload: CollegeEnrollmentCreate) {
    return Api.post<CollegeEnrollmentWithStudentDetails>(`/college/student-enrollments`, payload);
  },

  update(enrollment_id: number, payload: CollegeEnrollmentUpdate) {
    return Api.put<CollegeEnrollmentWithStudentDetails>(`/college/student-enrollments/${enrollment_id}`, payload);
  },

  delete(enrollment_id: number) {
    return Api.delete<void>(`/college/student-enrollments/${enrollment_id}`);
  },
};
