import { Api } from "@/lib/api";
import type {
  SchoolStudentCreate,
  SchoolStudentFullDetails,
  SchoolStudentRead,
  SchoolStudentUpdate,
  SchoolStudentsPaginatedResponse,
} from "@/lib/types/school";

export interface SchoolStudentsListParams {
  page?: number;
  page_size?: number;
}

export const SchoolStudentsService = {
  list(params?: SchoolStudentsListParams) {
    return Api.get<SchoolStudentsPaginatedResponse>(
      `/school/students`,
      params as
        | Record<string, string | number | boolean | null | undefined>
        | undefined
    );
  },

  getById(student_id: number) {
    return Api.get<SchoolStudentFullDetails>(`/school/students/${student_id}`);
  },

  getByAdmission(admission_no: string) {
    return Api.get<SchoolStudentFullDetails>(
      `/school/students/admission-no/${admission_no}`
    );
  },

  create(payload: SchoolStudentCreate) {
    return Api.post<SchoolStudentFullDetails>(`/school/students`, payload);
  },

  update(student_id: number, payload: SchoolStudentUpdate) {
    return Api.put<SchoolStudentFullDetails>(
      `/school/students/${student_id}`,
      payload
    );
  },

  delete(student_id: number) {
    return Api.delete<void>(`/school/students/${student_id}`);
  },

  /**
   * Create student from reservation using stored procedure
   */
  createFromReservation(payload: {
    reservation_id: number;
    student_name: string;
    aadhar_no: string;
    gender: string;
    dob: string;
    father_or_guardian_name: string;
    father_or_guardian_aadhar_no: string;
    father_or_guardian_mobile: string;
    father_or_guardian_occupation: string;
    mother_or_guardian_name: string;
    mother_or_guardian_aadhar_no: string;
    mother_or_guardian_mobile: string;
    mother_or_guardian_occupation: string;
    present_address: string;
    permanent_address: string;
    admission_fee: number;
  }) {
    return Api.post<SchoolStudentFullDetails>(`/school/students`, payload);
  },
};
