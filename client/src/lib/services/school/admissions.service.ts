import { Api } from "@/lib/api";
import { SchoolAdmissionListItem, SchoolAdmissionDetails } from "@/lib/types/school/admissions";

export const SchoolAdmissionsService = {
  /**
   * Get all admissions for UI display
   */
  list() {
    return Api.get<SchoolAdmissionListItem[]>("/school/admissions");
  },

  /**
   * Get admission details by student ID
   */
  getById(student_id: number) {
    return Api.get<SchoolAdmissionDetails>(`/school/admissions/${student_id}`);
  },
};

