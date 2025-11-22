import { Api } from "@/core/api";
import type { 
  SchoolStudentTransportAssignmentCreate,
  SchoolStudentTransportAssignmentUpdate,
  SchoolStudentTransportAssignmentRead,
  SchoolStudentTransportRouteWiseResponse,
  SchoolTransportDashboardStats 
} from "@/features/school/types/student-transport-assignments";

export const StudentTransportService = {
  list(params: { class_id: number; section_id?: number; bus_route_id?: number }): Promise<SchoolStudentTransportRouteWiseResponse[]> {
    const { class_id, section_id, bus_route_id } = params;
    const qs = new URLSearchParams();
    qs.append("class_id", String(class_id));
    if (section_id != null) qs.append("section_id", String(section_id));
    if (bus_route_id != null) qs.append("bus_route_id", String(bus_route_id));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return Api.get<SchoolStudentTransportRouteWiseResponse[]>(`/school/student-transport-assignments${suffix}`);
  },

  getById(transport_assignment_id: number): Promise<SchoolStudentTransportAssignmentRead> {
    return Api.get<SchoolStudentTransportAssignmentRead>(`/school/student-transport-assignments/${transport_assignment_id}`);
  },

  create(payload: SchoolStudentTransportAssignmentCreate): Promise<SchoolStudentTransportAssignmentRead> {
    return Api.post<SchoolStudentTransportAssignmentRead>(`/school/student-transport-assignments`, payload);
  },

  update(transport_assignment_id: number, payload: SchoolStudentTransportAssignmentUpdate): Promise<SchoolStudentTransportAssignmentRead> {
    return Api.put<SchoolStudentTransportAssignmentRead>(`/school/student-transport-assignments/${transport_assignment_id}`, payload);
  },

  getByAdmission(admission_no: string) {
    return Api.get<SchoolStudentTransportAssignmentRead[]>(`/school/student-transport-assignments/by-admission/${admission_no}`);
  },

  getDashboard() {
    return Api.get<SchoolTransportDashboardStats>(`/school/student-transport-assignments/dashboard`);
  },

  delete(transport_assignment_id: number): Promise<void> {
    return Api.delete<void>(`/school/student-transport-assignments/${transport_assignment_id}`);
  },
};


