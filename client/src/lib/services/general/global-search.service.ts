/**
 * Global Search Service
 * Handles unified search functionality across school and college branches
 */
import { SchoolStudentsService } from "../school/students.service";
import { CollegeStudentsService } from "../college/students.service";
import type { SchoolFullStudentRead } from "@/lib/types/school";
import type { CollegeFullStudentRead } from "@/lib/types/college";

export type GlobalSearchResult = SchoolFullStudentRead | CollegeFullStudentRead;

export interface GlobalSearchResponse {
  result: GlobalSearchResult | null;
  branchType: "SCHOOL" | "COLLEGE";
  error: string | null;
}

export const GlobalSearchService = {
  /**
   * Search for a student by admission number
   * Automatically determines whether to use school or college API based on branch type
   * 
   * @param admission_no - Student admission number
   * @param branchType - Branch type ("SCHOOL" or "COLLEGE")
   * @returns Promise with search result or error
   */
  async searchStudent(
    admission_no: string,
    branchType: "SCHOOL" | "COLLEGE"
  ): Promise<GlobalSearchResponse> {
    try {
      if (!admission_no || admission_no.trim() === "") {
        return {
          result: null,
          branchType,
          error: "Admission number is required",
        };
      }

      const trimmedAdmissionNo = admission_no.trim();

      if (branchType === "SCHOOL") {
        const result = await SchoolStudentsService.searchByAdmissionNo(
          trimmedAdmissionNo
        );
        return {
          result: result,
          branchType: "SCHOOL",
          error: null,
        };
      } else if (branchType === "COLLEGE") {
        const result = await CollegeStudentsService.searchByAdmissionNo(
          trimmedAdmissionNo
        );
        return {
          result: result,
          branchType: "COLLEGE",
          error: null,
        };
      } else {
        return {
          result: null,
          branchType,
          error: `Invalid branch type: ${branchType}`,
        };
      }
    } catch (error: any) {
      // Handle API errors
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to search student";
      return {
        result: null,
        branchType,
        error: errorMessage,
      };
    }
  },
};

