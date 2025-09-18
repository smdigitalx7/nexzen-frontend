import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AttendanceService } from "@/lib/services/attendance.service";
import type { EmployeeAttendanceRead, EmployeeAttendanceCreate, EmployeeAttendanceUpdate } from "@/lib/types/attendance";

const keys = {
  all: ["attendance", "all"] as const,
  branch: ["attendance", "branch"] as const,
  detail: (id: number) => ["attendance", id] as const,
};

export function useAttendanceAll() {
  return useQuery<EmployeeAttendanceRead[]>({ queryKey: keys.all, queryFn: () => AttendanceService.listAll() });
}

export function useAttendanceByBranch() {
  return useQuery<EmployeeAttendanceRead[]>({ queryKey: keys.branch, queryFn: () => AttendanceService.listByBranch() });
}

export function useAttendance(id: number) {
  return useQuery<EmployeeAttendanceRead>({ queryKey: keys.detail(id), queryFn: () => AttendanceService.getById(id), enabled: Number.isFinite(id) });
}

export function useCreateAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: EmployeeAttendanceCreate) => AttendanceService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.branch });
    },
  });
}

export function useUpdateAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EmployeeAttendanceUpdate }) => AttendanceService.update(id, payload),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.branch });
      qc.invalidateQueries({ queryKey: keys.detail(v.id) });
    },
  });
}

export function useDeleteAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => AttendanceService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.branch });
    },
  });
}


