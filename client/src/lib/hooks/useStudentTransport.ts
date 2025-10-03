import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StudentTransportService } from "@/lib/services/student-transport.service";
import type {
  StudentTransportAssignmentCreate,
  StudentTransportAssignmentUpdate,
  StudentTransportRouteWiseResponse,
} from "@/lib/types/school";
import { useToast } from "@/hooks/use-toast";

const keys = {
  transportByClass: (classId: number, sectionId?: number) => ["school", "student-transport", classId, sectionId || null] as const,
  transportAssignment: (id: number) => ["school", "student-transport", id] as const,
};

export function useStudentTransport(params: { class_id: number; section_id?: number }) {
  const queryKey = keys.transportByClass(params.class_id, params.section_id);
  return useQuery<StudentTransportRouteWiseResponse[]>({
    queryKey,
    queryFn: async () => StudentTransportService.list(params),
    enabled: Number.isFinite(params.class_id) && params.class_id > 0,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateStudentTransport() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (payload: StudentTransportAssignmentCreate) => StudentTransportService.create(payload),
    onSuccess: () => {
      toast({ title: "Success", description: "Student transport assigned." });
    },
  });
}

export function useUpdateStudentTransport() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: StudentTransportAssignmentUpdate }) => StudentTransportService.update(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: keys.transportAssignment(id) });
      toast({ title: "Success", description: "Student transport updated." });
    },
  });
}


