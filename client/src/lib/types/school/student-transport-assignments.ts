export interface SchoolStudentTransportAssignmentCreate {
  enrollment_id: number;
  bus_route_id: number;
  slab_id: number;
  pickup_point?: string | null;
  start_date: string;
  end_date?: string | null;
  is_active?: boolean | null;
}

export interface SchoolStudentTransportAssignmentUpdate {
  bus_route_id?: number;
  slab_id?: number;
  pickup_point?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean | null;
}

export interface SchoolStudentTransportAssignmentRead {
  transport_assignment_id: number;
  enrollment_id: number;
  bus_route_id: number;
  route_name?: string | null;
  slab_id: number;
  slab_name?: string | null;
  admission_no?: string | null;
  student_name?: string | null;
  roll_number?: string | null;
  class_name?: string | null;
  section_name?: string | null;
  pickup_point?: string | null;
  start_date: string;
  end_date?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface SchoolStudentTransportAssignmentMinimal {
  transport_assignment_id: number;
  enrollment_id: number;
  admission_no: string;
  student_name: string;
  roll_number: string;
  section_name?: string | null;
  slab_name?: string | null;
  pickup_point?: string | null;
  is_active?: boolean | null;
}

export interface SchoolStudentTransportClassWiseResponse {
  class_id: number;
  class_name: string;
  students: SchoolStudentTransportAssignmentMinimal[];
}

export interface SchoolStudentTransportRouteWiseResponse {
  bus_route_id: number;
  route_name: string;
  classes: SchoolStudentTransportClassWiseResponse[];
}


