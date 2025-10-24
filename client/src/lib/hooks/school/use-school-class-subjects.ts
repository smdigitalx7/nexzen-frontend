import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolClassSubjectsService } from "@/lib/services/school/class-subjects.service";
import type { SchoolClassSubjectCreate, SchoolClassSubjectRead, SchoolClassSubjectUpdate } from "@/lib/types/school";
import { schoolKeys } from "./query-keys";

export function useSchoolClassSubjectsList() {
  return useQuery({
    queryKey: schoolKeys.classSubjects.list(),
    queryFn: () => SchoolClassSubjectsService.list() as Promise<SchoolClassSubjectRead[]>,
  });
}


export function useCreateSchoolClassSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SchoolClassSubjectCreate) => SchoolClassSubjectsService.create(payload) as Promise<SchoolClassSubjectRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.classSubjects.root() });
    },
  });
}



