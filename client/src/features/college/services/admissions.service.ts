import { Api } from "@/core/api";
import {
  CollegeAdmissionListItem,
  CollegeAdmissionDetails,
  CollegeAdmissionsPaginatedResponse,
} from "@/features/college/types/admissions";

export interface CollegeAdmissionsListParams {
  page?: number;
  page_size?: number;
  // Optional filters (safe to pass; ignored if backend doesn't use it)
  search?: string;
}

export const CollegeAdmissionsService = {
  /**
   * Get all admissions for UI display with pagination
   */
  list(params?: CollegeAdmissionsListParams) {
    return Api.get<CollegeAdmissionsPaginatedResponse>(
      "/college/admissions",
      params as Record<string, string | number | boolean | null | undefined> | undefined
    );
  },

  /**
   * Get admission details by student ID
   */
  getById(student_id: number) {
    return Api.get<CollegeAdmissionDetails>(
      `/college/admissions/${student_id}`
    );
  },
};
