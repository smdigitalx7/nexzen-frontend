import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolClassSubjectsService } from "@/lib/services/school/class-subjects.service";
import type { SchoolClassSubjectCreate, SchoolClassSubjectRead, SchoolClassSubjectUpdate } from "@/lib/types/school";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useSchoolClassSubjectsList() {
  return useQuery({
    queryKey: schoolKeys.classSubjects.list(),
    queryFn: () => SchoolClassSubjectsService.list(),
  });
}


export function useCreateSchoolClassSubject() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolClassSubjectCreate) => SchoolClassSubjectsService.create(payload),
    onSuccess: (_, variables) => {
      // Invalidate all class-related queries
      void qc.invalidateQueries({ queryKey: schoolKeys.classSubjects.root() });
      void qc.invalidateQueries({ queryKey: schoolKeys.classes.root() });
      // Specifically invalidate the class detail query to refresh the subjects list
      void qc.invalidateQueries({ queryKey: schoolKeys.classes.detail(variables.class_id) });
      // Refetch active queries
      void qc.refetchQueries({ queryKey: schoolKeys.classSubjects.root(), type: 'active' });
      void qc.refetchQueries({ queryKey: schoolKeys.classes.root(), type: 'active' });
    },
  }, "Subject assigned to class successfully");
}



