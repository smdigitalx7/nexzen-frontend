import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { EnrollmentsService } from "@/features/school/services/enrollments.service";
import type { SchoolEnrollmentCreate, SchoolEnrollmentFilterParams, AssignSectionsRequest } from "@/features/school/types";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";
import { useToast } from "@/common/hooks/use-toast";

/**
 * ✅ OPTIMIZATION: Query key stabilized, supports enabled flag for tab gating
 */
export function useSchoolEnrollmentsList(params?: SchoolEnrollmentFilterParams & { enabled?: boolean }) {
  // ✅ OPTIMIZATION: Stabilize query key
  const stableParams = useMemo(() => {
    if (!params) return undefined;
    const { enabled, ...rest } = params;
    return rest;
  }, [params]);
  
  const queryKey = useMemo(
    () => schoolKeys.enrollments.list(stableParams as Record<string, unknown> | undefined),
    [stableParams]
  );

  // ✅ OPTIMIZATION: Check both tab enabled state AND class_id requirement
  const isEnabled = (params?.enabled !== false) && 
    (typeof (stableParams as any)?.class_id === "number" && (stableParams as any).class_id > 0);

  return useQuery({
    queryKey,
    queryFn: () => EnrollmentsService.list(stableParams as any),
    enabled: isEnabled,
    staleTime: 0, // Always consider data stale to refetch when params change
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: true, // Always refetch on mount when query key changes
  });
}

/** GET /school/enrollments/dashboard/academic-total — used by Academic Management stats cards. Invalidate on any Academic CRUD. */
export function useSchoolEnrollmentsAcademicTotal(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: schoolKeys.enrollments.academicTotal(),
    queryFn: () => EnrollmentsService.getAcademicTotal(),
    enabled: options?.enabled !== false,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useSchoolEnrollment(enrollmentId: number | null | undefined) {
  return useQuery({
    queryKey: typeof enrollmentId === "number" ? schoolKeys.enrollments.detail(enrollmentId) : [...schoolKeys.enrollments.root(), "detail", "nil"],
    queryFn: () => EnrollmentsService.getById(enrollmentId as number),
    enabled: typeof enrollmentId === "number" && enrollmentId > 0,
  });
}

export function useCreateSchoolEnrollment() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolEnrollmentCreate) => EnrollmentsService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.enrollments.root() });
      void qc.invalidateQueries({ queryKey: schoolKeys.enrollments.academicTotal() });
      void qc.refetchQueries({ queryKey: schoolKeys.enrollments.root(), type: 'active' });
    },
  }, "Enrollment created successfully");
}

export function useSchoolEnrollmentByAdmission(admissionNo: string | null | undefined) {
  return useQuery({
    queryKey: admissionNo ? [...schoolKeys.enrollments.root(), "by-admission", admissionNo] : [...schoolKeys.enrollments.root(), "by-admission", "nil"],
    queryFn: () => EnrollmentsService.getByAdmission(admissionNo as string),
    enabled: Boolean(admissionNo && admissionNo.trim()),
  });
}

export function useSchoolEnrollmentsForSectionAssignment(classId: number | null | undefined) {
  return useQuery({
    queryKey: classId ? [...schoolKeys.enrollments.root(), "for-section-assignment", classId] : [...schoolKeys.enrollments.root(), "for-section-assignment", "nil"],
    queryFn: () => EnrollmentsService.getForSectionAssignment(classId as number),
    enabled: typeof classId === "number" && classId > 0,
  });
}

export function useGenerateRollNumbers() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (class_id: number) => EnrollmentsService.generateRollNumbers(class_id),
    onSuccess: (data, class_id) => {
      void qc.invalidateQueries({ queryKey: schoolKeys.enrollments.root() });
      void qc.invalidateQueries({
        queryKey: [...schoolKeys.enrollments.root(), "for-section-assignment", class_id],
      });
      void qc.refetchQueries({ queryKey: schoolKeys.enrollments.root(), type: "active" });
      toast({
        title: "Success",
        description: `Roll numbers generated successfully (${data.updated_count} updated).`,
        variant: "success",
      });
    },
  });
}

export function useAssignSectionsToEnrollments() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: AssignSectionsRequest) => EnrollmentsService.assignSections(payload),
    onSuccess: (_, variables) => {
      void qc.invalidateQueries({ queryKey: schoolKeys.enrollments.root() });
      void qc.invalidateQueries({ queryKey: schoolKeys.enrollments.academicTotal() });
      void qc.invalidateQueries({ 
        queryKey: [...schoolKeys.enrollments.root(), "for-section-assignment", variables.class_id] 
      });
      void qc.invalidateQueries({ 
        queryKey: ["school-dropdowns", "sections", variables.class_id] 
      });
      void qc.invalidateQueries({ 
        queryKey: schoolKeys.sections.listByClass(variables.class_id) 
      });
      void qc.refetchQueries({ queryKey: schoolKeys.enrollments.root(), type: 'active' });
      void qc.refetchQueries({ 
        queryKey: ["school-dropdowns", "sections", variables.class_id],
        type: 'active' 
      });
    },
  }, "Sections assigned successfully");
}

export function useChangeEnrollmentSection() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast(
    {
      mutationFn: ({
        enrollment_id,
        section_id,
        class_id,
      }: {
        enrollment_id: number;
        section_id: number;
        class_id: number;
      }) => EnrollmentsService.changeEnrollmentSection(enrollment_id, section_id),
      onSuccess: (_, variables) => {
        void qc.invalidateQueries({ queryKey: schoolKeys.enrollments.root() });
        void qc.invalidateQueries({ queryKey: schoolKeys.enrollments.academicTotal() });
        void qc.invalidateQueries({ queryKey: schoolKeys.enrollments.detail(variables.enrollment_id) });
        void qc.invalidateQueries({
          queryKey: [...schoolKeys.enrollments.root(), "for-section-assignment", variables.class_id],
        });
        void qc.refetchQueries({ queryKey: schoolKeys.enrollments.root(), type: "active" });
      },
    },
    "Section updated successfully"
  );
}
