import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { SchoolStudentAttendanceService } from "@/lib/services/school/student-attendance.service";
import type { SchoolBulkCreateAttendanceResult, SchoolBulkStudentAttendanceCreate, SchoolStudentAttendanceCreate, SchoolStudentAttendancePaginatedResponse, SchoolStudentAttendanceRead, SchoolStudentAttendanceUpdate } from "@/lib/types/school";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useSchoolAttendanceList(params?: { page?: number; page_size?: number; admission_no?: string }) {
  return useQuery({
    queryKey: schoolKeys.attendance.list(params as Record<string, unknown> | undefined),
    queryFn: () => SchoolStudentAttendanceService.list(params),
  });
}

export function useSchoolAttendance(attendanceId: number | null | undefined) {
  return useQuery({
    queryKey: typeof attendanceId === "number" ? schoolKeys.attendance.detail(attendanceId) : [...schoolKeys.attendance.root(), "detail", "nil"],
    queryFn: () => SchoolStudentAttendanceService.getById(attendanceId as number),
    enabled: typeof attendanceId === "number" && attendanceId > 0,
  });
}

export function useSchoolAttendanceByAdmission(admissionNo: string | null | undefined) {
  return useQuery({
    queryKey: admissionNo ? schoolKeys.attendance.byAdmission(admissionNo) : [...schoolKeys.attendance.root(), "by-admission", "nil"],
    queryFn: () => SchoolStudentAttendanceService.getByAdmission(admissionNo as string),
    enabled: typeof admissionNo === "string" && admissionNo.length > 0,
  });
}

export function useCreateSchoolAttendance() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolStudentAttendanceCreate) => SchoolStudentAttendanceService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.attendance.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.attendance.root(), type: 'active' });
    },
  }, "Attendance created successfully");
}

export function useBulkCreateSchoolAttendance() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolBulkStudentAttendanceCreate) => SchoolStudentAttendanceService.bulkCreate(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.attendance.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.attendance.root(), type: 'active' });
    },
  }, "Attendance records created successfully");
}

export function useUpdateSchoolAttendance(attendanceId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolStudentAttendanceUpdate) => SchoolStudentAttendanceService.update(attendanceId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.attendance.detail(attendanceId) });
      void qc.invalidateQueries({ queryKey: schoolKeys.attendance.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.attendance.root(), type: 'active' });
    },
  }, "Attendance updated successfully");
}

export function useDeleteSchoolAttendance() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (attendanceId: number) => SchoolStudentAttendanceService.delete(attendanceId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.attendance.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.attendance.root(), type: 'active' });
    },
  }, "Attendance deleted successfully");
}

/**
 * ✅ OPTIMIZATION: Query key stabilized, supports enabled flag for tab gating
 */
export function useSchoolAttendanceAllStudents(params: { class_id: number; month: number; year: number; section_id?: number | null; } | null) {
  // ✅ OPTIMIZATION: Stabilize query key
  const queryKey = useMemo(
    () => params ? [...schoolKeys.attendance.root(), "all-students", params] : [...schoolKeys.attendance.root(), "all-students", "nil"],
    [params]
  );

  return useQuery({
    queryKey,
    queryFn: () => SchoolStudentAttendanceService.getAllStudents(params!),
    enabled: !!params && typeof params.class_id === 'number' && params.class_id > 0 && typeof params.month === 'number' && typeof params.year === 'number',
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: true, // Only refetch on mount if data is stale
  });
}

export function useBulkUpdateSchoolAttendance() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: any) => SchoolStudentAttendanceService.bulkUpdate(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.attendance.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.attendance.root(), type: 'active' });
    },
  }, "Attendance records updated successfully");
}
