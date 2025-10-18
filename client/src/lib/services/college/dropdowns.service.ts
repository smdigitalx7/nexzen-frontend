import { Api } from "@/lib/api";
import type { 
  ClassesResponse, 
  GroupsResponse, 
  CoursesResponse, 
  SubjectsResponse, 
  ExamsResponse, 
  TestsResponse 
} from "@/lib/types/college/dropdowns";

/**
 * CollegeDropdownsService - Handles all college-specific dropdowns API operations
 * 
 * Required roles for most operations: ADMIN, ACADEMIC, TEACHER, ACCOUNTANT, INSTITUTE_ADMIN
 * 
 * Available endpoints:
 * - GET /college/dropdowns/classes - Get classes
 * - GET /college/dropdowns/groups - Get groups
 * - GET /college/dropdowns/courses - Get courses
 * - GET /college/dropdowns/subjects - Get subjects
 * - GET /college/dropdowns/exams - Get exams
 * - GET /college/dropdowns/tests - Get tests
 */
export const CollegeDropdownsService = {
  /**
   * Get all classes
   * @returns Promise<ClassesResponse> - List of classes
   */
  getClasses(): Promise<ClassesResponse> {
    return Api.get<ClassesResponse>("/college/dropdowns/classes");
  },

  /**
   * Get all groups
   * @param classId - Optional class ID to filter groups
   * @returns Promise<GroupsResponse> - List of groups
   */
  getGroups(classId?: number): Promise<GroupsResponse> {
    return Api.get<GroupsResponse>("/college/dropdowns/groups", classId ? { class_id: classId } : undefined);
  },

  /**
   * Get all courses
   * @param groupId - Group ID to filter courses
   * @returns Promise<CoursesResponse> - List of courses
   */
  getCourses(groupId: number): Promise<CoursesResponse> {
    return Api.get<CoursesResponse>("/college/dropdowns/courses", { group_id: groupId });
  },

  /**
   * Get all subjects
   * @param groupId - Group ID to filter subjects
   * @returns Promise<SubjectsResponse> - List of subjects
   */
  getSubjects(groupId: number): Promise<SubjectsResponse> {
    return Api.get<SubjectsResponse>("/college/dropdowns/subjects", { group_id: groupId });
  },

  /**
   * Get all exams
   * @returns Promise<ExamsResponse> - List of exams
   */
  getExams(): Promise<ExamsResponse> {
    return Api.get<ExamsResponse>("/college/dropdowns/exams");
  },

  /**
   * Get all tests
   * @returns Promise<TestsResponse> - List of tests
   */
  getTests(): Promise<TestsResponse> {
    return Api.get<TestsResponse>("/college/dropdowns/tests");
  },
};
