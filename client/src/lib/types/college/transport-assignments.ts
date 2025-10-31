export interface CollegeTransportAssignmentCreate {
  enrollment_id: number;
  bus_route_id: number;
  slab_id: number;
  pickup_point?: string | null;
  start_date: string; // ISO date
  end_date?: string | null; // ISO date
  is_active?: boolean;
}

export interface CollegeTransportAssignmentUpdate {
  bus_route_id?: number;
  slab_id?: number;
  pickup_point?: string | null;
  start_date?: string;
  end_date?: string | null;
  is_active?: boolean;
}

export interface CollegeTransportAssignmentRead {
  transport_assignment_id: number;
  enrollment_id: number;
  bus_route_id: number;
  route_name: string;
  slab_id: number;
  slab_name: string;
  class_name: string;
  section_name: string;
  group_id: number;
  group_name: string;
  admission_no: string;
  student_name: string;
  roll_number: string;
  pickup_point: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number;
}

export interface CollegeTransportAssignmentListResponse {
  data: CollegeTransportAssignmentRead[];
  total: number;
  pages: number;
  current_page: number;
}

export interface CollegeStudentTransportDashboardStats {
  total_assignments: number;
  active_assignments: number;
  inactive_assignments: number;
  total_routes: number;
  total_students_by_route: Record<string, number>;
  assignments_this_month: number;
  assignments_this_year: number;
}

// Types for the hierarchical API response
export interface CollegeTransportStudent {
  transport_assignment_id: number;
  enrollment_id: number;
  slab_id: number;
  slab_name: string;
  admission_no: string;
  student_name: string;
  roll_number: string;
  pickup_point: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface CollegeTransportGroup {
  class_id: number;
  class_name: string;
  group_id: number;
  group_name: string;
  students: CollegeTransportStudent[];
}

export interface CollegeTransportRoute {
  bus_route_id: number;
  route_name: string;
  groups: CollegeTransportGroup[];
}

