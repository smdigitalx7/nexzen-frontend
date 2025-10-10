import { Api } from "@/lib/api";
import type { SchoolBulkCreateAttendanceResult, SchoolBulkStudentAttendanceCreate, SchoolStudentAttendanceCreate, SchoolStudentAttendancePaginatedResponse, SchoolStudentAttendanceRead, SchoolStudentAttendanceUpdate } from "@/lib/types/school";

export interface SchoolAttendanceListParams {
  page?: number;
  page_size?: number;
  admission_no?: string;
}

export const SchoolStudentAttendanceService = {
  list(params?: SchoolAttendanceListParams) {
    return Api.get<SchoolStudentAttendancePaginatedResponse>(`/school/student-attendance`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  getById(attendance_id: number) {
    return Api.get<SchoolStudentAttendanceRead>(`/school/student-attendance/${attendance_id}`);
  },

  getByAdmission(admission_no: string) {
    return Api.get<SchoolStudentAttendanceRead[]>(`/school/student-attendance/by-admission/${admission_no}`);
  },

  create(payload: SchoolStudentAttendanceCreate) {
    return Api.post<SchoolStudentAttendanceRead>(`/school/student-attendance`, payload);
  },

  bulkCreate(payload: SchoolBulkStudentAttendanceCreate) {
    return Api.post<SchoolBulkCreateAttendanceResult>(`/school/student-attendance/bulk-create`, payload);
  },

  update(attendance_id: number, payload: SchoolStudentAttendanceUpdate) {
    return Api.put<SchoolStudentAttendanceRead>(`/school/student-attendance/${attendance_id}`, payload);
  },

  delete(attendance_id: number) {
    return Api.delete<void>(`/school/student-attendance/${attendance_id}`);
  },

  getAllStudents() {
    return Api.get<any[]>(`/school/student-attendance/students`);
  },

  bulkUpdate(payload: any) {
    return Api.put<any>(`/school/student-attendance/bulk-update`, payload);
  },
};


