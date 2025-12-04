import { Api } from "@/core/api";
import type { 
  SchoolExamCreate, 
  SchoolExamRead, 
  SchoolExamUpdate,
  SchoolExamWithScheduleRead,
  ExamScheduleCreate,
  ExamScheduleUpdate,
  ExamScheduleRead,
} from "@/features/school/types";

export const SchoolExamsService = {
  list(params?: { include_schedule?: boolean }) {
    return Api.get<SchoolExamWithScheduleRead[]>(`/school/exams`, params);
  },

  getById(exam_id: number, params?: { include_schedule?: boolean }) {
    return Api.get<SchoolExamWithScheduleRead>(`/school/exams/${exam_id}`, params);
  },

  create(payload: SchoolExamCreate) {
    return Api.post<SchoolExamRead>(`/school/exams`, payload);
  },

  update(exam_id: number, payload: SchoolExamUpdate) {
    return Api.put<SchoolExamRead>(`/school/exams/${exam_id}`, payload);
  },

  delete(exam_id: number) {
    return Api.delete<void>(`/school/exams/${exam_id}`);
  },

  // Exam Schedule endpoints
  createSchedule(exam_id: number, payload: ExamScheduleCreate) {
    return Api.post<ExamScheduleRead>(`/school/exams/${exam_id}/schedules`, payload);
  },

  getSchedules(exam_id: number) {
    return Api.get<ExamScheduleRead[]>(`/school/exams/${exam_id}/schedules`);
  },

  updateSchedule(exam_id: number, academic_year_id: number, payload: ExamScheduleUpdate) {
    return Api.put<ExamScheduleRead>(`/school/exams/${exam_id}/schedules/${academic_year_id}`, payload);
  },

  deleteSchedule(exam_id: number, academic_year_id: number) {
    return Api.delete<void>(`/school/exams/${exam_id}/schedules/${academic_year_id}`);
  },
};


