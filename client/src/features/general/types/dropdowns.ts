/**
 * Dropdowns Types
 * 
 * Types for public dropdowns API endpoints
 * Base path: /api/v1/dropdowns
 */

export interface PublicDropdownsResponse {
  reservation_status: string[];
  role_types: string[];
  employee_types: string[];
  employee_status: string[];
  leave_types: string[];
  leave_status: string[];
  genders: string[];
  branch_types: string[];
  advance_status: string[];
  payment_methods: string[];
  payroll_status: string[];
  term_status: string[];
  payment_status: string[];
  income_purposes: string[];
  priorities: string[];
  target_audiences: string[];
  announcement_types: string[];
  student_status: string[];
}
