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
  slab_id: number;
  pickup_point?: string | null;
  start_date: string;
  end_date?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
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

