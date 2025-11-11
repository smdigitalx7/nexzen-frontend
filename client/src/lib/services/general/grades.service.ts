import { Api } from "@/lib/api";
import type {
  GradeRead,
  GradeCreate,
  GradeUpdate,
} from "@/lib/types/general/grades";

/**
 * GradesService - Handles all grade-related API operations
 * 
 * Required roles for most operations: ADMIN, INSTITUTE_ADMIN
 * 
 * Available endpoints:
 * - GET /grades - List all grades
 * - GET /grades/{grade_code} - Get grade by code
 * - POST /grades - Create new grade
 * - PUT /grades/{grade_code} - Update grade
 * - DELETE /grades/{grade_code} - Delete grade
 */
export const GradesService = {
  /**
   * Get all grades for the current branch
   * @returns Promise<GradeRead[]> - List of all grades
   */
  listGrades(): Promise<GradeRead[]> {
    return Api.get<GradeRead[]>("/grades");
  },

  /**
   * Get a specific grade by code
   * @param gradeCode - Grade code (e.g., "A+", "B", "F")
   * @returns Promise<GradeRead> - Grade details
   */
  getGradeByCode(gradeCode: string): Promise<GradeRead> {
    return Api.get<GradeRead>(`/grades/${encodeURIComponent(gradeCode)}`);
  },

  /**
   * Create a new grade
   * @param data - Grade creation data
   * @returns Promise<GradeRead> - Created grade
   */
  createGrade(data: GradeCreate): Promise<GradeRead> {
    return Api.post<GradeRead>("/grades", data);
  },

  /**
   * Update an existing grade
   * @param gradeCode - Grade code to update
   * @param data - Grade update data
   * @returns Promise<GradeRead> - Updated grade
   */
  updateGrade(gradeCode: string, data: GradeUpdate): Promise<GradeRead> {
    return Api.put<GradeRead>(`/grades/${encodeURIComponent(gradeCode)}`, data);
  },

  /**
   * Delete a grade
   * @param gradeCode - Grade code to delete
   * @returns Promise<void>
   */
  deleteGrade(gradeCode: string): Promise<void> {
    return Api.delete<void>(`/grades/${encodeURIComponent(gradeCode)}`);
  },
};

