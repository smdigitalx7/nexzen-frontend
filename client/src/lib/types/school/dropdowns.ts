/**
 * School Dropdowns Types
 * 
 * Types for school-specific dropdowns API endpoints
 * Base path: /api/v1/school/dropdowns
 */

export interface ClassOption {
  class_id: number;
  class_name: string;
}

export interface SectionOption {
  class_id: number;
  section_id: number;
  section_name: string;
}

export interface SubjectOption {
  class_id: number;
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

export interface SectionsResponse {
  items: SectionOption[];
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
