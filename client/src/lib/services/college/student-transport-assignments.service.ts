import { Api } from "@/lib/api";
import { CollegeTransportAssignmentCreate, CollegeTransportAssignmentRead, CollegeTransportAssignmentUpdate, CollegeStudentTransportDashboardStats } from "@/lib/types/college";

export const CollegeStudentTransportAssignmentsService = {
  // GET /api/v1/college/student-transport-assignments/dashboard
  dashboard() {
    return Api.get<CollegeStudentTransportDashboardStats>(`/college/student-transport-assignments/dashboard`);
  },

  // GET /api/v1/college/student-transport-assignments
  list() {
    return Api.get<CollegeTransportAssignmentRead[]>(`/college/student-transport-assignments`);
  },

  // GET /api/v1/college/student-transport-assignments/{assignment_id}
  getById(assignment_id: number) {
    return Api.get<CollegeTransportAssignmentRead>(`/college/student-transport-assignments/${assignment_id}`);
  },

  // POST /api/v1/college/student-transport-assignments
  create(payload: CollegeTransportAssignmentCreate) {
    return Api.post<CollegeTransportAssignmentRead>(`/college/student-transport-assignments`, payload);
  },

  // PUT /api/v1/college/student-transport-assignments/{assignment_id}
  update(assignment_id: number, payload: CollegeTransportAssignmentUpdate) {
    return Api.put<CollegeTransportAssignmentRead>(`/college/student-transport-assignments/${assignment_id}`, payload);
  },

  // DELETE /api/v1/college/student-transport-assignments/{assignment_id}
  delete(assignment_id: number) {
    return Api.delete<void>(`/college/student-transport-assignments/${assignment_id}`);
  },
};


