import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolTeacherClassSubjectsService } from "@/lib/services/school/teacher-class-subjects.service";
import type { 
  SchoolTeacherClassSubjectCreate, 
  SchoolTeacherClassSubjectRead,
  SchoolTeacherDetail 
} from "@/lib/types/school";
import { schoolKeys } from "./query-keys";

export function useTeacherClassSubjectsHierarchical() {
  return useQuery({
    queryKey: schoolKeys.teacherClassSubjects.hierarchical(),
    queryFn: () => SchoolTeacherClassSubjectsService.getHierarchical() as Promise<SchoolTeacherDetail[]>,
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
    mutationFn: ({ teacherId, classId, subjectId, sectionId }: { teacherId: number; classId: number; subjectId: number; sectionId: number }) => {
      return SchoolTeacherClassSubjectsService.delete(teacherId, classId, subjectId, sectionId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.teacherClassSubjects.root() });
    },
  });
}
