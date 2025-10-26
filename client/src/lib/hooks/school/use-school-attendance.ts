import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolStudentAttendanceService } from "@/lib/services/school/student-attendance.service";
import type { SchoolBulkCreateAttendanceResult, SchoolBulkStudentAttendanceCreate, SchoolStudentAttendanceCreate, SchoolStudentAttendancePaginatedResponse, SchoolStudentAttendanceRead, SchoolStudentAttendanceUpdate } from "@/lib/types/school";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useSchoolAttendanceList(params?: { page?: number; page_size?: number; admission_no?: string }) {
  return useQuery({
    queryKey: schoolKeys.attendance.list(params as Record<string, unknown> | undefined),
    queryFn: () => SchoolStudentAttendanceService.list(params) as Promise<SchoolStudentAttendancePaginatedResponse>,
  });
}

export function useSchoolAttendance(attendanceId: number | null | undefined) {
  return useQuery({
    queryKey: typeof attendanceId === "number" ? schoolKeys.attendance.detail(attendanceId) : [...schoolKeys.attendance.root(), "detail", "nil"],
    queryFn: () => SchoolStudentAttendanceService.getById(attendanceId as number) as Promise<SchoolStudentAttendanceRead>,
    enabled: typeof attendanceId === "number" && attendanceId > 0,
  });
}

export function useSchoolAttendanceByAdmission(admissionNo: string | null | undefined) {
  return useQuery({
    queryKey: admissionNo ? schoolKeys.attendance.byAdmission(admissionNo) : [...schoolKeys.attendance.root(), "by-admission", "nil"],
    queryFn: () => SchoolStudentAttendanceService.getByAdmission(admissionNo as string) as Promise<SchoolStudentAttendanceRead[]>,
    enabled: typeof admissionNo === "string" && admissionNo.length > 0,
  });
}

export function useCreateSchoolAttendance() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolStudentAttendanceCreate) => SchoolStudentAttendanceService.create(payload) as Promise<SchoolStudentAttendanceRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.attendance.root() });
    },
  }, "Attendance created successfully");
}

export function useBulkCreateSchoolAttendance() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolBulkStudentAttendanceCreate) => SchoolStudentAttendanceService.bulkCreate(payload) as Promise<SchoolBulkCreateAttendanceResult>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.attendance.root() });
    },
  }, "Attendance records created successfully");
}

export function useUpdateSchoolAttendance(attendanceId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolStudentAttendanceUpdate) => SchoolStudentAttendanceService.update(attendanceId, payload) as Promise<SchoolStudentAttendanceRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.attendance.detail(attendanceId) });
      qc.invalidateQueries({ queryKey: schoolKeys.attendance.root() });
    },
  }, "Attendance updated successfully");
}

export function useDeleteSchoolAttendance() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (attendanceId: number) => SchoolStudentAttendanceService.delete(attendanceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.attendance.root() });
    },
  }, "Attendance deleted successfully");
}

export function useSchoolAttendanceAllStudents(params: { class_id: number; section_id?: number | null; month?: number | null; year?: number | null; } | null) {
  return useQuery({
    queryKey: params ? [...schoolKeys.attendance.root(), "all-students", params] : [...schoolKeys.attendance.root(), "all-students", "nil"],
    queryFn: () => SchoolStudentAttendanceService.getAllStudents(params as any),
    enabled: !!params && typeof params.class_id === 'number' && params.class_id > 0,
  });
}

export function useBulkUpdateSchoolAttendance() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: any) => SchoolStudentAttendanceService.bulkUpdate(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.attendance.root() });
    },
  }, "Attendance records updated successfully");
}
