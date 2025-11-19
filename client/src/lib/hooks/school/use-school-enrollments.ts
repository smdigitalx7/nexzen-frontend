import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { EnrollmentsService } from "@/lib/services/school/enrollments.service";
import type { SchoolEnrollmentCreate, SchoolEnrollmentFilterParams, SchoolEnrollmentWithStudentDetails, SchoolEnrollmentsPaginatedResponse, SchoolEnrollmentForSectionAssignment, AssignSectionsRequest } from "@/lib/types/school";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

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
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: true, // Only refetch on mount if data is stale
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

export function useAssignSectionsToEnrollments() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: AssignSectionsRequest) => EnrollmentsService.assignSections(payload),
    onSuccess: (_, variables) => {
      // Invalidate enrollment queries to refresh the data
      void qc.invalidateQueries({ queryKey: schoolKeys.enrollments.root() });
      void qc.invalidateQueries({ 
        queryKey: [...schoolKeys.enrollments.root(), "for-section-assignment", variables.class_id] 
      });
      // Invalidate sections dropdown cache to refresh filter options
      void qc.invalidateQueries({ 
        queryKey: ["school-dropdowns", "sections", variables.class_id] 
      });
      // Also invalidate sections list cache
      void qc.invalidateQueries({ 
        queryKey: schoolKeys.sections.listByClass(variables.class_id) 
      });
      void qc.refetchQueries({ queryKey: schoolKeys.enrollments.root(), type: 'active' });
      // Refetch sections dropdown for the class
      void qc.refetchQueries({ 
        queryKey: ["school-dropdowns", "sections", variables.class_id],
        type: 'active' 
      });
    },
  }, "Sections assigned successfully");
}
