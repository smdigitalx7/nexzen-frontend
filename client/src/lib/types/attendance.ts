export interface EmployeeAttendanceRead {
  attendance_id: number;
  employee_id: number;
  branch_id: number;
  date: string;
  status: string;
}

export interface EmployeeAttendanceCreate {
  employee_id: number;
  date: string;
  status: string;
}

export type EmployeeAttendanceUpdate = Partial<EmployeeAttendanceCreate>;


