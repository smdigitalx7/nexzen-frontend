import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeAttendanceService } from "@/features/college/services/attendance.service";
import type { CollegeStudentAttendanceBulkCreate, CollegeStudentAttendanceBulkCreateResult, CollegeStudentAttendancePaginatedResponse, CollegeStudentAttendanceRead, CollegeStudentAttendanceCreate, CollegeStudentAttendanceUpdate } from "@/features/college/types/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";

export function useCollegeAttendanceList(params?: { page?: number; pageSize?: number; admission_no?: string }) {
  return useQuery({
    queryKey: collegeKeys.attendance.list(params),
    queryFn: () => CollegeAttendanceService.list(params),
  });
}

export function useCollegeAttendance(attendanceId: number | null | undefined) {
  return useQuery({
    queryKey: typeof attendanceId === "number" ? collegeKeys.attendance.detail(attendanceId) : [...collegeKeys.attendance.root(), "detail", "nil"],
    queryFn: () => CollegeAttendanceService.getById(attendanceId as number),
    enabled: typeof attendanceId === "number" && attendanceId > 0,
  });
}

export function useCollegeAttendanceByAdmission(admissionNo: string | null | undefined) {
  return useQuery({
    queryKey: admissionNo ? collegeKeys.attendance.byAdmission(admissionNo) : [...collegeKeys.attendance.root(), "by-admission", "nil"],
    queryFn: () => CollegeAttendanceService.getByAdmission(admissionNo as string),
    enabled: typeof admissionNo === "string" && admissionNo.length > 0,
  });
}

export function useCreateCollegeAttendance() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeStudentAttendanceCreate) => CollegeAttendanceService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.attendance.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.attendance.root(), type: 'active' });
    },
  }, "Attendance created successfully");
}

export function useBulkCreateCollegeAttendance() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeStudentAttendanceBulkCreate) => CollegeAttendanceService.bulkCreate(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.attendance.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.attendance.root(), type: 'active' });
    },
  }, "Attendance records created successfully");
}

export function useUpdateCollegeAttendance(attendanceId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeStudentAttendanceUpdate) => CollegeAttendanceService.update(attendanceId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.attendance.detail(attendanceId) });
      void qc.invalidateQueries({ queryKey: collegeKeys.attendance.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.attendance.root(), type: 'active' });
    },
  }, "Attendance updated successfully");
}

export function useDeleteCollegeAttendance() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (attendanceId: number) => CollegeAttendanceService.delete(attendanceId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.attendance.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.attendance.root(), type: 'active' });
    },
  }, "Attendance deleted successfully");
}
