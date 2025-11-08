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
   * Uses: GET /api/v1/college/groups
   * @param classId - Optional class ID to filter groups (not used in API, kept for compatibility)
   * @returns Promise<GroupsResponse> - List of groups with group_fee
   */
  async getGroups(classId?: number): Promise<GroupsResponse> {
    // Use the direct groups API endpoint
    const groups = await Api.get<Array<{
      group_id: number;
      group_name: string;
      book_fee: number;
      group_fee: number;
    }>>("/college/groups");
    
    // Transform to GroupsResponse format
    return {
      items: groups.map(g => ({
        group_id: g.group_id,
        group_name: g.group_name,
        group_fee: g.group_fee,
        book_fee: g.book_fee,
      })),
    };
  },

  /**
   * Get courses for a group
   * Uses: GET /api/v1/college/groups/{group_id}/courses
   * @param groupId - Group ID to get courses for
   * @returns Promise<CoursesResponse> - List of courses with course_fee
   */
  async getCourses(groupId: number): Promise<CoursesResponse> {
    // Use the group with courses API endpoint
    const groupWithCourses = await Api.get<{
      group_id: number;
      group_name: string;
      book_fee: number;
      group_fee: number;
      courses: Array<{
        course_id: number;
        course_name: string;
        course_fee: number;
      }>;
    }>(`/college/groups/${groupId}/courses`);
    
    // Transform to CoursesResponse format
    return {
      items: (groupWithCourses.courses || []).map(c => ({
        group_id: groupWithCourses.group_id,
        course_id: c.course_id,
        course_name: c.course_name,
        course_fee: c.course_fee,
      })),
    };
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
