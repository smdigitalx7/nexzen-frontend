import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeStudentTransportAssignmentsService } from "@/lib/services/college/student-transport-assignments.service";
import type { CollegeTransportAssignmentCreate, CollegeTransportAssignmentRead, CollegeTransportAssignmentUpdate, CollegeStudentTransportDashboardStats, CollegeTransportRoute } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useCollegeStudentTransportAssignments() {
  return useQuery({
    queryKey: collegeKeys.studentTransport.list(),
    queryFn: () => CollegeStudentTransportAssignmentsService.list() as Promise<CollegeTransportRoute[]>,
  });
}

export function useCollegeStudentTransportAssignment(assignmentId: number | null | undefined) {
  return useQuery({
    queryKey: typeof assignmentId === "number" ? collegeKeys.studentTransport.detail(assignmentId) : [...collegeKeys.studentTransport.root(), "detail", "nil"],
    queryFn: () => CollegeStudentTransportAssignmentsService.getById(assignmentId as number) as Promise<CollegeTransportAssignmentRead>,
    enabled: typeof assignmentId === "number" && assignmentId > 0,
  });
}

export function useCreateCollegeStudentTransportAssignment() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeTransportAssignmentCreate) => CollegeStudentTransportAssignmentsService.create(payload) as Promise<CollegeTransportAssignmentRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.studentTransport.root() });
    },
  }, "Student transport assigned successfully");
}

export function useUpdateCollegeStudentTransportAssignment(assignmentId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeTransportAssignmentUpdate) => CollegeStudentTransportAssignmentsService.update(assignmentId, payload) as Promise<CollegeTransportAssignmentRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.studentTransport.detail(assignmentId) });
      qc.invalidateQueries({ queryKey: collegeKeys.studentTransport.root() });
    },
  }, "Student transport updated successfully");
}

export function useDeleteCollegeStudentTransportAssignment() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (assignmentId: number) => CollegeStudentTransportAssignmentsService.delete(assignmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.studentTransport.root() });
    },
  }, "Student transport removed successfully");
}

export function useCollegeStudentTransportDashboard() {
  return useQuery({
    queryKey: [...collegeKeys.studentTransport.root(), "dashboard"],
    queryFn: () => CollegeStudentTransportAssignmentsService.dashboard(),
  });
}
