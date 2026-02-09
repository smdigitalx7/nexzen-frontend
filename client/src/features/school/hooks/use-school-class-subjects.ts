import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolClassSubjectsService } from "@/features/school/services/class-subjects.service";
import type { SchoolClassSubjectCreate, SchoolClassSubjectRead, SchoolClassSubjectUpdate } from "@/features/school/types";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";

export function useSchoolClassSubjectsList() {
  return useQuery({
    queryKey: schoolKeys.classSubjects.list(),
    queryFn: () => SchoolClassSubjectsService.list(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}


export function useCreateSchoolClassSubject() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolClassSubjectCreate) => SchoolClassSubjectsService.create(payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: schoolKeys.classSubjects.root() }).catch(console.error);
      qc.invalidateQueries({ queryKey: schoolKeys.classes.root() }).catch(console.error);
      qc.invalidateQueries({ queryKey: schoolKeys.enrollments.academicTotal() }).catch(console.error);
      qc.invalidateQueries({ queryKey: schoolKeys.classes.detail(variables.class_id) }).catch(console.error);
      qc.refetchQueries({ queryKey: schoolKeys.classSubjects.root(), type: 'active' }).catch(console.error);
      qc.refetchQueries({ queryKey: schoolKeys.classes.root(), type: 'active' }).catch(console.error);
    },
  }, "Subject assigned to class successfully");
}



