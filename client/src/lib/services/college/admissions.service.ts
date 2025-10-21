import { Api } from "@/lib/api";
import {
  CollegeAdmissionListItem,
  CollegeAdmissionDetails,
} from "@/lib/types/college/admissions";

export const CollegeAdmissionsService = {
  /**
   * Get all admissions for UI display
   */
  list() {
    return Api.get<CollegeAdmissionListItem[]>("/college/admissions");
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
