import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.classSubjects.root() });
    },
  }, "Subject assigned to class successfully");
}



