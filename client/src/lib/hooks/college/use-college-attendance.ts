import { useQuery } from "@tanstack/react-query";
import { CollegeAttendanceService } from "@/lib/services/college/attendance.service";
import type { CollegeStudentAttendancePaginatedResponse, CollegeStudentAttendanceRead } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";

export function useCollegeAttendanceList(params?: { page?: number; pageSize?: number; admission_no?: string }) {
  return useQuery({
    queryKey: collegeKeys.attendance.list(params as Record<string, unknown> | undefined),
    queryFn: () => CollegeAttendanceService.list(params) as Promise<CollegeStudentAttendancePaginatedResponse>,
  });
}

export function useCollegeAttendance(attendanceId: number | null | undefined) {
  return useQuery({
    queryKey: typeof attendanceId === "number" ? collegeKeys.attendance.detail(attendanceId) : [...collegeKeys.attendance.root(), "detail", "nil"],
    queryFn: () => CollegeAttendanceService.getById(attendanceId as number) as Promise<CollegeStudentAttendanceRead>,
    enabled: typeof attendanceId === "number" && attendanceId > 0,
  });
}

export function useCollegeAttendanceByAdmission(admissionNo: string | null | undefined) {
  return useQuery({
    queryKey: admissionNo ? collegeKeys.attendance.byAdmission(admissionNo) : [...collegeKeys.attendance.root(), "by-admission", "nil"],
    queryFn: () => CollegeAttendanceService.getByAdmission(admissionNo as string) as Promise<CollegeStudentAttendanceRead[]>,
    enabled: typeof admissionNo === "string" && admissionNo.length > 0,
  });
}


