import { Api } from "@/core/api";
import { CollegeStudentCreate, CollegeStudentFullDetails, CollegeStudentUpdate, CollegeStudentsPaginatedResponse, CollegeFullStudentRead } from "@/features/college/types";

export interface CollegeStudentsListParams {
  page?: number;
  page_size?: number;
  // Optional filters (backend supports these)
  class_id?: number;
  group_id?: number;
  course_id?: number;
  search?: string;
}

export const CollegeStudentsService = {
  list(params?: CollegeStudentsListParams) {
    return Api.get<CollegeStudentsPaginatedResponse>(`/college/students`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  getById(student_id: number) {
    return Api.get<CollegeStudentFullDetails>(`/college/students/${student_id}`);
  },

  getByAdmission(admission_no: string) {
    return Api.get<CollegeStudentFullDetails>(`/college/students/by-admission/${admission_no}`);
  },

  create(payload: CollegeStudentCreate) {
    return Api.post<CollegeStudentFullDetails>(`/college/students`, payload);
  },

  update(student_id: number, payload: CollegeStudentUpdate) {
    return Api.put<CollegeStudentFullDetails>(`/college/students/${student_id}`, payload);
  },
 
  delete(student_id: number) {
    return Api.delete<void>(`/college/students/${student_id}`);
  },

  /**
   * Search for a student by admission number using full-student view
   * Returns complete student details including enrollment, transport, fees, and receipts
   */
  searchByAdmissionNo(admission_no: string) {
    return Api.get<CollegeFullStudentRead>(
      `/college/full-student/search/${admission_no}`
    );
  },
};
