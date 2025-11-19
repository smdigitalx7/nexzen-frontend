import { Api } from "@/lib/api";
import type {
  SchoolStudentCreate,
  SchoolStudentFullDetails,
  SchoolStudentRead,
  SchoolStudentUpdate,
  SchoolStudentsPaginatedResponse,
  SchoolFullStudentRead,
} from "@/lib/types/school";

export interface SchoolStudentsListParams {
  page?: number;
  page_size?: number;
}

/**
 * School Students Service
 * 
 * Provides API methods for managing school students.
 * All methods return promises that resolve to typed responses.
 * 
 * @example
 * ```typescript
 * // List students with pagination
 * const students = await SchoolStudentsService.list({ page: 1, page_size: 50 });
 * 
 * // Get student by ID
 * const student = await SchoolStudentsService.getById(123);
 * ```
 */
export const SchoolStudentsService = {
  /**
   * List school students with pagination
   * 
   * @param params - Pagination parameters (page, page_size)
   * @returns Promise resolving to paginated list of students
   */
  list(params?: SchoolStudentsListParams) {
    return Api.get<SchoolStudentsPaginatedResponse>(
      `/school/students`,
      params as
        | Record<string, string | number | boolean | null | undefined>
        | undefined
    );
  },

  /**
   * Get a single student by ID
   * 
   * @param student_id - The student ID
   * @returns Promise resolving to full student details
   */
  getById(student_id: number) {
    return Api.get<SchoolStudentFullDetails>(`/school/students/${student_id}`);
  },

  /**
   * Get a student by admission number
   * 
   * @param admission_no - The admission number
   * @returns Promise resolving to full student details
   */
  getByAdmission(admission_no: string) {
    return Api.get<SchoolStudentFullDetails>(
      `/school/students/admission-no/${admission_no}`
    );
  },

  /**
   * Create a new student
   * 
   * @param payload - Student creation data
   * @returns Promise resolving to created student details
   */
  create(payload: SchoolStudentCreate) {
    return Api.post<SchoolStudentFullDetails>(`/school/students`, payload);
  },

  /**
   * Update an existing student
   * 
   * @param student_id - The student ID to update
   * @param payload - Partial student data to update
   * @returns Promise resolving to updated student details
   */
  update(student_id: number, payload: SchoolStudentUpdate) {
    return Api.put<SchoolStudentFullDetails>(
      `/school/students/${student_id}`,
      payload
    );
  },

  /**
   * Delete a student
   * 
   * @param student_id - The student ID to delete
   * @returns Promise resolving to void
   */
  delete(student_id: number) {
    return Api.delete<void>(`/school/students/${student_id}`);
  },

  /**
   * Create student from reservation using stored procedure
   */
  createFromReservation(payload: {
    reservation_id: number;
    student_name: string;
    aadhar_no: string;
    gender: string;
    dob: string;
    father_or_guardian_name: string;
    father_or_guardian_aadhar_no: string;
    father_or_guardian_mobile: string;
    father_or_guardian_occupation: string;
    mother_or_guardian_name: string;
    mother_or_guardian_aadhar_no: string;
    mother_or_guardian_mobile: string;
    mother_or_guardian_occupation: string;
    present_address: string;
    permanent_address: string;
    admission_fee: number;
  }) {
    return Api.post<SchoolStudentFullDetails>(`/school/students`, payload);
  },

  /**
   * Search for a student by admission number using full-student view
   * Returns complete student details including enrollment, transport, fees, and receipts
   */
  searchByAdmissionNo(admission_no: string) {
    return Api.get<SchoolFullStudentRead>(
      `/school/full-student/search/${admission_no}`
    );
  },
};
