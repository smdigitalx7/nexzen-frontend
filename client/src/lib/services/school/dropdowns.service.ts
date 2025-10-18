import { Api } from "@/lib/api";
import type { 
  ClassesResponse, 
  SectionsResponse, 
  SubjectsResponse, 
  ExamsResponse, 
  TestsResponse 
} from "@/lib/types/school/dropdowns";

/**
 * SchoolDropdownsService - Handles all school-specific dropdowns API operations
 * 
 * Required roles for most operations: ADMIN, ACADEMIC, TEACHER, ACCOUNTANT, INSTITUTE_ADMIN
 * 
 * Available endpoints:
 * - GET /school/dropdowns/classes - Get classes
 * - GET /school/dropdowns/sections - Get sections
 * - GET /school/dropdowns/subjects - Get subjects
 * - GET /school/dropdowns/exams - Get exams
 * - GET /school/dropdowns/tests - Get tests
 */
export const SchoolDropdownsService = {
  /**
   * Get all classes
   * @returns Promise<ClassesResponse> - List of classes
   */
  getClasses(): Promise<ClassesResponse> {
    return Api.get<ClassesResponse>("/school/dropdowns/classes");
  },

  /**
   * Get all sections
   * @param classId - Class ID to filter sections
   * @returns Promise<SectionsResponse> - List of sections
   */
  getSections(classId: number): Promise<SectionsResponse> {
    return Api.get<SectionsResponse>("/school/dropdowns/sections", { class_id: classId });
  },

  /**
   * Get all subjects
   * @param classId - Class ID to filter subjects
   * @returns Promise<SubjectsResponse> - List of subjects
   */
  getSubjects(classId: number): Promise<SubjectsResponse> {
    return Api.get<SubjectsResponse>("/school/dropdowns/subjects", { class_id: classId });
  },

  /**
   * Get all exams
   * @returns Promise<ExamsResponse> - List of exams
   */
  getExams(): Promise<ExamsResponse> {
    return Api.get<ExamsResponse>("/school/dropdowns/exams");
  },

  /**
   * Get all tests
   * @returns Promise<TestsResponse> - List of tests
   */
  getTests(): Promise<TestsResponse> {
    return Api.get<TestsResponse>("/school/dropdowns/tests");
  },
};
