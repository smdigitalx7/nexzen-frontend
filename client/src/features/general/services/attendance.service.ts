import { Api } from "@/core/api";
import type { EmployeeAttendanceRead, EmployeeAttendanceCreate, EmployeeAttendanceUpdate } from "@/features/general/types/attendance";

export const AttendanceService = {
  listAll(): Promise<EmployeeAttendanceRead[]> {
    return Api.get("/employee-attendances");
  },
  listByBranch(): Promise<EmployeeAttendanceRead[]> {
    return Api.get("/employee-attendances/branch");
  },
  getById(id: number): Promise<EmployeeAttendanceRead> {
    return Api.get(`/employee-attendances/${id}`);
  },
  create(payload: EmployeeAttendanceCreate): Promise<EmployeeAttendanceRead> {
    return Api.post("/employee-attendances", payload);
  },
  update(id: number, payload: EmployeeAttendanceUpdate): Promise<EmployeeAttendanceRead> {
    return Api.put(`/employee-attendances/${id}`, payload);
  },
  remove(id: number): Promise<boolean> {
    return Api.delete(`/employee-attendances/${id}`) as unknown as Promise<boolean>;
  },
};


