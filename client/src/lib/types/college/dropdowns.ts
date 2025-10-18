/**
 * College Dropdowns Types
 * 
 * Types for college-specific dropdowns API endpoints
 * Base path: /api/v1/college/dropdowns
 */

export interface ClassOption {
  class_id: number;
  class_name: string;
}

export interface GroupOption {
  group_id: number;
  group_name: string;
}

export interface CourseOption {
  group_id: number;
  course_id: number;
  course_name: string;
}

export interface SubjectOption {
  group_id: number;
  subject_id: number;
  subject_name: string;
}

export interface ExamOption {
  exam_id: number;
  exam_name: string;
  exam_date?: string;
}

export interface TestOption {
  test_id: number;
  test_name: string;
  test_date?: string;
}

export interface ClassesResponse {
  items: ClassOption[];
}

export interface GroupsResponse {
  items: GroupOption[];
}

export interface CoursesResponse {
  items: CourseOption[];
}

export interface SubjectsResponse {
  items: SubjectOption[];
}

export interface ExamsResponse {
  items: ExamOption[];
}

export interface TestsResponse {
  items: TestOption[];
}
