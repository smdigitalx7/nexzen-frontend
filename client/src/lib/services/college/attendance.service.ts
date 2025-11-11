import { Api } from "@/lib/api";
import { CollegeStudentAttendanceBulkCreate, CollegeStudentAttendanceBulkCreateResult, CollegeStudentAttendancePaginatedResponse, CollegeStudentAttendanceRead, CollegeStudentAttendanceWithClassGroup, CollegeStudentAttendanceUpdate, CollegeStudentAttendanceCreate } from "@/lib/types/college";

export interface CollegeAttendanceListParams {
  page?: number;
  pageSize?: number;
  admission_no?: string;
}

export const CollegeAttendanceService = {
  // GET /api/v1/college/student-attendance
  list(params?: CollegeAttendanceListParams) {
    return Api.get<CollegeStudentAttendancePaginatedResponse>(`/college/student-attendance`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  // GET /api/v1/college/student-attendance (grouped by class/group with nested students)
  getAll(params: { class_id: number; group_id: number; month: number; year: number }) {
    return Api.get<CollegeStudentAttendanceWithClassGroup[]>(`/college/student-attendance`, params as Record<string, string | number | boolean | null | undefined>);
  },

  // GET /api/v1/college/student-attendance/students
  listStudents(params?: { class_id?: number; group_id?: number; course_id?: number }) {
    return Api.get<CollegeStudentAttendanceWithClassGroup[]>(`/college/student-attendance/students`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  // GET /api/v1/college/student-attendance/{attendance_id}
  getById(attendance_id: number) {
    return Api.get<CollegeStudentAttendanceRead>(`/college/student-attendance/${attendance_id}`);
  },

  // GET /api/v1/college/student-attendance/by-admission/{admission_no}
  getByAdmission(admission_no: string) {
    return Api.get<CollegeStudentAttendanceRead[]>(`/college/student-attendance/by-admission/${admission_no}`);
  },

  // POST /api/v1/college/student-attendance
  create(payload: CollegeStudentAttendanceCreate) {
    return Api.post<CollegeStudentAttendanceRead>(`/college/student-attendance`, payload);
  },

  // POST /api/v1/college/student-attendance/bulk-create
  bulkCreate(payload: CollegeStudentAttendanceBulkCreate) {
    return Api.post<CollegeStudentAttendanceBulkCreateResult>(`/college/student-attendance/bulk-create`, payload);
  },

  // PUT /api/v1/college/student-attendance/{attendance_id}
  update(attendance_id: number, payload: CollegeStudentAttendanceUpdate) {
    return Api.put<CollegeStudentAttendanceRead>(`/college/student-attendance/${attendance_id}`, payload);
  },

  // DELETE /api/v1/college/student-attendance/{attendance_id}
  delete(attendance_id: number) {
    return Api.delete<void>(`/college/student-attendance/${attendance_id}`);
  },
};
