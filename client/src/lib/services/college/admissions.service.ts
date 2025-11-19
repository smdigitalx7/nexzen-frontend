import { Api } from "@/lib/api";
import {
  CollegeAdmissionListItem,
  CollegeAdmissionDetails,
  CollegeAdmissionsPaginatedResponse,
} from "@/lib/types/college/admissions";

export interface CollegeAdmissionsListParams {
  page?: number;
  page_size?: number;
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
