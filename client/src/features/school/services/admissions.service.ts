import { Api } from "@/core/api";
import { SchoolAdmissionListItem, SchoolAdmissionDetails, SchoolAdmissionsPaginatedResponse } from "@/features/school/types/admissions";

export interface SchoolAdmissionsListParams {
  page?: number;
  page_size?: number;
  // Optional filters (safe to pass; ignored if backend doesn't use it)
  search?: string;
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

