import { Api } from "@/core/api";
import { CollegeTransportAssignmentCreate, CollegeTransportAssignmentRead, CollegeTransportAssignmentUpdate, CollegeTransportAssignmentCancel, CollegeStudentTransportDashboardStats, CollegeTransportRoute } from "@/features/college/types";

export const CollegeStudentTransportAssignmentsService = {
  // GET /api/v1/college/student-transport-assignments/dashboard
  dashboard() {
    return Api.get<CollegeStudentTransportDashboardStats>(`/college/student-transport-assignments/dashboard`);
  },

  // GET /api/v1/college/student-transport-assignments
  list(params?: { class_id?: number; group_id?: number; bus_route_id?: number; page?: number; page_size?: number }) {
    const qs = new URLSearchParams();
    if (params?.class_id != null) qs.append("class_id", String(params.class_id));
    if (params?.group_id != null) qs.append("group_id", String(params.group_id));
    if (params?.bus_route_id != null) qs.append("bus_route_id", String(params.bus_route_id));
    if (params?.page != null) qs.append("page", String(params.page));
    if (params?.page_size != null) qs.append("page_size", String(params.page_size));
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

  // POST /api/v1/college/student-transport-assignments/{assignment_id}/cancel
  cancel(assignment_id: number, payload: CollegeTransportAssignmentCancel) {
    return Api.post<any>(`/college/student-transport-assignments/${assignment_id}/cancel`, payload);
  },
};


