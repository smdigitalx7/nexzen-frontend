import { Api } from "@/core/api";
import { CollegeTeacherCourseSubjectCreate, CollegeTeacherCourseSubjectRead, CollegeTeacherCourseSubjectUpdate, CollegeTeacherCourseSubjectGroupedRead } from "@/features/college/types";

export interface CollegeTeacherCourseSubjectListParams {
  group_id?: number | null;
  course_id?: number | null;
}

export const CollegeTeacherCourseSubjectsService = {
  // GET /api/v1/college/teacher-course-subjects
  list(params?: CollegeTeacherCourseSubjectListParams) {
    return Api.get<CollegeTeacherCourseSubjectGroupedRead[]>(`/college/teacher-course-subjects`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  // POST /api/v1/college/teacher-course-subjects
  create(payload: CollegeTeacherCourseSubjectCreate) {
    return Api.post<CollegeTeacherCourseSubjectRead>(`/college/teacher-course-subjects`, payload);
  },

  // GET /api/v1/college/teacher-course-subjects/teacher/{teacher_id}
  listByTeacher(teacher_id: number) {
    return Api.get<CollegeTeacherCourseSubjectRead[]>(`/college/teacher-course-subjects/teacher/${teacher_id}`);
  },

  // DELETE /api/v1/college/teacher-course-subjects/teacher/{teacher_id}
  deleteByTeacher(teacher_id: number) {
    return Api.delete<void>(`/college/teacher-course-subjects/teacher/${teacher_id}`);
  },

  // DELETE /api/v1/college/teacher-course-subjects/teacher/{teacher_id}/courses/{course_id}/subjects/{subject_id}
  deleteRelation(teacher_id: number, course_id: number, subject_id: number) {
    return Api.delete<void>(`/college/teacher-course-subjects/teacher/${teacher_id}/courses/${course_id}/subjects/${subject_id}`);
  },
};


