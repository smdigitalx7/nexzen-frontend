import { Api } from "@/lib/api";
import { SchoolAdmissionListItem, SchoolAdmissionDetails, SchoolAdmissionsPaginatedResponse } from "@/lib/types/school/admissions";

export interface SchoolAdmissionsListParams {
  page?: number;
  page_size?: number;
}

export const SchoolAdmissionsService = {
  /**
   * Get all admissions for UI display with pagination
   */
  list(params?: SchoolAdmissionsListParams) {
    return Api.get<SchoolAdmissionsPaginatedResponse>(
      "/school/admissions",
      params as Record<string, string | number | boolean | null | undefined> | undefined
    );
  },

  /**
   * Get admission details by student ID
   */
  getById(student_id: number) {
    return Api.get<SchoolAdmissionDetails>(`/school/admissions/${student_id}`);
  },
};

