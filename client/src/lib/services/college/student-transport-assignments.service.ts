import { Api } from "@/lib/api";
import { CollegeTransportAssignmentCreate, CollegeTransportAssignmentRead, CollegeTransportAssignmentUpdate, CollegeStudentTransportDashboardStats, CollegeTransportRoute } from "@/lib/types/college";

export const CollegeStudentTransportAssignmentsService = {
  // GET /api/v1/college/student-transport-assignments/dashboard
  dashboard() {
    return Api.get<CollegeStudentTransportDashboardStats>(`/college/student-transport-assignments/dashboard`);
  },

  // GET /api/v1/college/student-transport-assignments
  list(params?: { class_id?: number; group_id?: number; bus_route_id?: number }) {
    const qs = new URLSearchParams();
    if (params?.class_id != null) qs.append("class_id", String(params.class_id));
    if (params?.group_id != null) qs.append("group_id", String(params.group_id));
    if (params?.bus_route_id != null) qs.append("bus_route_id", String(params.bus_route_id));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return Api.get<CollegeTransportRoute[]>(`/college/student-transport-assignments${suffix}`);
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


