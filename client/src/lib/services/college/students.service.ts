import { Api } from "@/lib/api";

export interface CollegeStudentsListParams {
  page?: number;
  pageSize?: number;
}

export const CollegeStudentsService = {
  list(params?: CollegeStudentsListParams) {
    return Api.get<unknown>(`/college/students`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  getById(student_id: number) {
    return Api.get<unknown>(`/college/students/${student_id}`);
  },

  getByAdmission(admission_no: string) {
    return Api.get<unknown>(`/college/students/by-admission/${admission_no}`);
  },

  create(payload: unknown) {
    return Api.post<unknown>(`/college/students`, payload);
  },

  update(student_id: number, payload: unknown) {
    return Api.put<unknown>(`/college/students/${student_id}`, payload);
  },

  delete(student_id: number) {
    return Api.delete<void>(`/college/students/${student_id}`);
  },
};


