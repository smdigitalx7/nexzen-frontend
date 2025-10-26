import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeAttendanceService } from "@/lib/services/college/attendance.service";
import type { CollegeStudentAttendanceBulkCreate, CollegeStudentAttendanceBulkCreateResult, CollegeStudentAttendancePaginatedResponse, CollegeStudentAttendanceRead, CollegeStudentAttendanceCreate, CollegeStudentAttendanceUpdate } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useCollegeAttendanceList(params?: { page?: number; pageSize?: number; admission_no?: string }) {
  return useQuery({
    queryKey: collegeKeys.attendance.list(params),
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

export function useCreateCollegeAttendance() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeStudentAttendanceCreate) => CollegeAttendanceService.create(payload) as Promise<CollegeStudentAttendanceRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.attendance.root() });
    },
  }, "Attendance created successfully");
}

export function useBulkCreateCollegeAttendance() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeStudentAttendanceBulkCreate) => CollegeAttendanceService.bulkCreate(payload) as Promise<CollegeStudentAttendanceBulkCreateResult>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.attendance.root() });
    },
  }, "Attendance records created successfully");
}

export function useUpdateCollegeAttendance(attendanceId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeStudentAttendanceUpdate) => CollegeAttendanceService.update(attendanceId, payload) as Promise<CollegeStudentAttendanceRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.attendance.detail(attendanceId) });
      qc.invalidateQueries({ queryKey: collegeKeys.attendance.root() });
    },
  }, "Attendance updated successfully");
}

export function useDeleteCollegeAttendance() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (attendanceId: number) => CollegeAttendanceService.delete(attendanceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.attendance.root() });
    },
  }, "Attendance deleted successfully");
}
