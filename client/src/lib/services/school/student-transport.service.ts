import { Api } from "@/lib/api";
import type {
  StudentTransportAssignmentCreate,
  StudentTransportAssignmentUpdate,
  StudentTransportRouteWiseResponse,
  StudentTransportAssignmentRead,
} from "@/lib/types/school/school";

export const StudentTransportService = {
  list(params: { class_id: number; section_id?: number; bus_route_id?: number }): Promise<StudentTransportRouteWiseResponse[]> {
    const { class_id, section_id, bus_route_id } = params;
    const qs = new URLSearchParams();
    qs.append("class_id", String(class_id));
    if (section_id != null) qs.append("section_id", String(section_id));
    if (bus_route_id != null) qs.append("bus_route_id", String(bus_route_id));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return Api.get<StudentTransportRouteWiseResponse[]>(`/school/student-transport-assignments${suffix}`);
  },

  getById(transport_assignment_id: number): Promise<StudentTransportAssignmentRead> {
    return Api.get<StudentTransportAssignmentRead>(`/school/student-transport-assignments/${transport_assignment_id}`);
  },

  create(payload: StudentTransportAssignmentCreate): Promise<StudentTransportAssignmentRead> {
    return Api.post<StudentTransportAssignmentRead>(`/school/student-transport-assignments`, payload);
  },

  update(transport_assignment_id: number, payload: StudentTransportAssignmentUpdate): Promise<StudentTransportAssignmentRead> {
    return Api.put<StudentTransportAssignmentRead>(`/school/student-transport-assignments/${transport_assignment_id}`, payload);
  },

  getByAdmission(admission_no: string) {
    return Api.get<StudentTransportAssignmentRead[]>(`/school/student-transport-assignments/by-admission/${admission_no}`);
  },

  getDashboard() {
    return Api.get<any>(`/school/student-transport-assignments/dashboard`);
  },
};


