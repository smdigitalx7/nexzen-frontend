/**
 * Grades Types
 * 
 * Types for grade management API endpoints
 * Base path: /api/v1/grades
 */

export interface GradeRead {
  branch_id: number;
  grade: string;
  min_percentage: number;
  max_percentage: number;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}

export interface GradeCreate {
  grade: string;
  min_percentage: number;
  max_percentage: number;
}

export interface GradeUpdate {
  min_percentage?: number;
  max_percentage?: number;
}

export interface GradeListResponse {
  items: GradeRead[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

