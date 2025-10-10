import { Api } from "@/lib/api";

export const CollegeStudentTransportAssignmentsService = {
  // GET /api/v1/college/student-transport-assignments
  list() {
    return Api.get<unknown>(`/college/student-transport-assignments`);
  },

  // GET /api/v1/college/student-transport-assignments/{assignment_id}
  getById(assignment_id: number) {
    return Api.get<unknown>(`/college/student-transport-assignments/${assignment_id}`);
  },

  // POST /api/v1/college/student-transport-assignments
  create(payload: unknown) {
    return Api.post<unknown>(`/college/student-transport-assignments`, payload);
  },

  // PUT /api/v1/college/student-transport-assignments/{assignment_id}
  update(assignment_id: number, payload: unknown) {
    return Api.put<unknown>(`/college/student-transport-assignments/${assignment_id}`, payload);
  },

  // DELETE /api/v1/college/student-transport-assignments/{assignment_id}
  delete(assignment_id: number) {
    return Api.delete<void>(`/college/student-transport-assignments/${assignment_id}`);
  },
};


