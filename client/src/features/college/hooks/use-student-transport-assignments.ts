import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeStudentTransportAssignmentsService } from "@/features/college/services/student-transport-assignments.service";
import type { CollegeTransportAssignmentCreate, CollegeTransportAssignmentRead, CollegeTransportAssignmentUpdate, CollegeTransportAssignmentCancel, CollegeStudentTransportDashboardStats, CollegeTransportRoute } from "@/features/college/types/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";

export function useCollegeStudentTransportAssignments(params?: { class_id?: number; group_id?: number; bus_route_id?: number }) {
  return useQuery({
    queryKey: collegeKeys.studentTransport.list(params),
    queryFn: () => CollegeStudentTransportAssignmentsService.list(params),
    enabled: !!params && !!params.class_id && !!params.group_id,
  });
}

export function useCollegeStudentTransportAssignmentById(assignmentId: number | null | undefined) {
  return useQuery({
    queryKey: typeof assignmentId === "number" ? collegeKeys.studentTransport.detail(assignmentId) : [...collegeKeys.studentTransport.root(), "detail", "nil"],
    queryFn: () => CollegeStudentTransportAssignmentsService.getById(assignmentId as number),
    enabled: typeof assignmentId === "number" && assignmentId > 0,
  });
}

export function useCreateCollegeStudentTransportAssignment() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeTransportAssignmentCreate) => CollegeStudentTransportAssignmentsService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.studentTransport.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.studentTransport.root(), type: 'active' });
    },
  }, "Student transport assigned successfully");
}

export function useUpdateCollegeStudentTransportAssignment() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: ({ id, payload }: { id: number; payload: CollegeTransportAssignmentUpdate }) =>
      CollegeStudentTransportAssignmentsService.update(id, payload),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: collegeKeys.studentTransport.root() });
      void qc.invalidateQueries({ queryKey: collegeKeys.studentTransport.detail(id) });
      void qc.refetchQueries({ queryKey: collegeKeys.studentTransport.root(), type: 'active' });
    },
  }, "Student transport updated successfully");
}

export function useDeleteCollegeStudentTransportAssignment() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (assignmentId: number) => CollegeStudentTransportAssignmentsService.delete(assignmentId),
    onSuccess: (_, assignmentId) => {
      void qc.invalidateQueries({ queryKey: collegeKeys.studentTransport.root() });
      qc.invalidateQueries({ queryKey: collegeKeys.studentTransport.detail(assignmentId) });
      void qc.refetchQueries({ queryKey: collegeKeys.studentTransport.root(), type: 'active' });
    },
  }, "Student transport assignment deleted successfully");
}

export function useCancelCollegeStudentTransportAssignment() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: ({ assignmentId, payload }: { assignmentId: number; payload: CollegeTransportAssignmentCancel }) => 
      CollegeStudentTransportAssignmentsService.cancel(assignmentId, payload),
    onSuccess: (_, { assignmentId }) => {
      void qc.invalidateQueries({ queryKey: collegeKeys.studentTransport.root() });
      void qc.invalidateQueries({ queryKey: collegeKeys.studentTransport.detail(assignmentId) });
      void qc.refetchQueries({ queryKey: collegeKeys.studentTransport.root(), type: 'active' });
    },
  }, "Transport assignment cancelled successfully");
}

export function useCollegeStudentTransportDashboard() {
  return useQuery({
    queryKey: [...collegeKeys.studentTransport.root(), "dashboard"],
    queryFn: () => CollegeStudentTransportAssignmentsService.dashboard(),
  });
}
