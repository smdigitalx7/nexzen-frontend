import { Api } from "@/lib/api";

export interface CollegeAttendanceListParams {
  page?: number;
  pageSize?: number;
  admission_no?: string;
}

export const CollegeAttendanceService = {
  // GET /api/v1/college/student-attendance
  list(params?: CollegeAttendanceListParams) {
    return Api.get<unknown>(`/college/student-attendance`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  // GET /api/v1/college/student-attendance/{attendance_id}
  getById(attendance_id: number) {
    return Api.get<unknown>(`/college/student-attendance/${attendance_id}`);
  },

  // GET /api/v1/college/student-attendance/by-admission/{admission_no}
  getByAdmission(admission_no: string) {
    return Api.get<unknown>(`/college/student-attendance/by-admission/${admission_no}`);
  },

  // POST /api/v1/college/student-attendance
  create(payload: unknown) {
    return Api.post<unknown>(`/college/student-attendance`, payload);
  },

  // POST /api/v1/college/student-attendance/bulk-create
  bulkCreate(payload: unknown) {
    return Api.post<unknown>(`/college/student-attendance/bulk-create`, payload);
  },

  // PUT /api/v1/college/student-attendance/{attendance_id}
  update(attendance_id: number, payload: unknown) {
    return Api.put<unknown>(`/college/student-attendance/${attendance_id}`, payload);
  },

  // DELETE /api/v1/college/student-attendance/{attendance_id}
  delete(attendance_id: number) {
    return Api.delete<void>(`/college/student-attendance/${attendance_id}`);
  },
};


