import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolTeacherClassSubjectsService } from "@/lib/services/school/teacher-class-subjects.service";
import type { SchoolTeacherClassSubjectCreate, SchoolTeacherClassSubjectRead } from "@/lib/types/school";
import { schoolKeys } from "./query-keys";

export function useTeacherClassSubjects() {
  return useQuery({
    queryKey: schoolKeys.teacherClassSubjects.list(),
    queryFn: () => SchoolTeacherClassSubjectsService.list() as Promise<SchoolTeacherClassSubjectRead[]>,
  });
}

export function useCreateTeacherClassSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SchoolTeacherClassSubjectCreate) => SchoolTeacherClassSubjectsService.create(payload) as Promise<SchoolTeacherClassSubjectRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.teacherClassSubjects.root() });
    },
  });
}

export function useDeleteTeacherClassSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teacherId, classId, subjectId }: { teacherId: number; classId: number; subjectId: number }) => SchoolTeacherClassSubjectsService.delete(teacherId, classId, subjectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.teacherClassSubjects.root() });
    },
  });
}
