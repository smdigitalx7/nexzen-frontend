import { useQuery, useQueryClient } from "@tanstack/react-query";
import { StudentTransportService } from "@/lib/services/school/student-transport.service";
import type { SchoolStudentTransportAssignmentCreate, SchoolStudentTransportAssignmentUpdate, SchoolStudentTransportRouteWiseResponse, SchoolStudentTransportAssignmentRead } from "@/lib/types/school";
import type { SchoolTransportDashboardStats } from "@/lib/types/school/student-transport-assignments";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

const keys = {
  root: ["school", "student-transport"] as const,
  byClass: (classId: number, sectionId?: number, busRouteId?: number) => ["school", "student-transport", classId, sectionId ?? null, busRouteId ?? null] as const,
  detail: (assignmentId: number) => ["school", "student-transport", assignmentId] as const,
};

export function useSchoolStudentTransport(params: { class_id: number; section_id?: number; bus_route_id?: number }) {
  return useQuery({
    queryKey: keys.byClass(params.class_id, params.section_id, params.bus_route_id),
    queryFn: () => StudentTransportService.list(params),
    enabled: Number.isFinite(params.class_id) && params.class_id > 0,
  });
}

export function useCreateSchoolStudentTransport() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolStudentTransportAssignmentCreate) => StudentTransportService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.root });
      void qc.refetchQueries({ queryKey: keys.root, type: 'active' });
    },
  }, "Student transport assigned successfully");
}

export function useSchoolStudentTransportById(assignmentId: number | null | undefined) {
  return useQuery({
    queryKey: assignmentId ? keys.detail(assignmentId) : [...keys.root, "detail", "nil"],
    queryFn: () => StudentTransportService.getById(assignmentId as number),
    enabled: typeof assignmentId === "number" && assignmentId > 0,
  });
}

export function useUpdateSchoolStudentTransport() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: ({ id, payload }: { id: number; payload: SchoolStudentTransportAssignmentUpdate }) => StudentTransportService.update(id, payload),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: keys.root });
      void qc.invalidateQueries({ queryKey: keys.detail(id) });
      void qc.refetchQueries({ queryKey: keys.root, type: 'active' });
    },
  }, "Student transport updated successfully");
}

export function useDeleteSchoolStudentTransport() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (id: number) => StudentTransportService.delete(id),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: keys.root });
      void qc.invalidateQueries({ queryKey: keys.detail(id) });
      void qc.refetchQueries({ queryKey: keys.root, type: 'active' });
    },
  }, "Student transport assignment deleted successfully");
}

export function useSchoolStudentTransportDashboard() {
  return useQuery({
    queryKey: [...keys.root, "dashboard"],
    queryFn: () => StudentTransportService.getDashboard(),
  });
}

export function useSchoolStudentTransportByAdmission(admissionNo: string | null | undefined) {
  return useQuery({
    queryKey: admissionNo ? [...keys.root, "by-admission", admissionNo] : [...keys.root, "by-admission", "nil"],
    queryFn: () => StudentTransportService.getByAdmission(admissionNo as string),
    enabled: typeof admissionNo === "string" && admissionNo.length > 0,
  });
}
