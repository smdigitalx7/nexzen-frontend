import { useQuery } from "@tanstack/react-query";
import { SchoolDropdownsService } from "@/lib/services/school/dropdowns.service";

/**
 * Hook for fetching school classes
 * 
 * ✅ OPTIMIZATION: On-demand fetching - only fetches when enabled or explicitly refetched
 */
export const useSchoolClasses = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["school-dropdowns", "classes"],
    queryFn: () => SchoolDropdownsService.getClasses(),
    enabled: options?.enabled === true, // ✅ OPTIMIZATION: Only fetch when explicitly enabled (on-demand)
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: false, // ✅ OPTIMIZATION: No auto-refetch on mount - fetch on demand only
  });
};

/**
 * Hook for fetching school sections - only fetches when a valid classId is provided
 * 
 * ✅ OPTIMIZATION: On-demand fetching - only fetches when enabled or explicitly refetched
 */
export const useSchoolSections = (classId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: classId > 0 ? ["school-dropdowns", "sections", classId] : ["school-dropdowns", "sections", "disabled"],
    queryFn: () => SchoolDropdownsService.getSections(classId),
    enabled: options?.enabled === true && classId > 0, // ✅ OPTIMIZATION: Only fetch when explicitly enabled AND classId is valid
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: false, // ✅ OPTIMIZATION: No auto-refetch on mount - fetch on demand only
  });
};

/**
 * Hook for fetching school subjects - only fetches when a valid classId is provided
 * 
 * ✅ OPTIMIZATION: On-demand fetching - only fetches when enabled or explicitly refetched
 */
export const useSchoolSubjects = (classId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: classId > 0 ? ["school-dropdowns", "subjects", classId] : ["school-dropdowns", "subjects", "disabled"],
    queryFn: () => SchoolDropdownsService.getSubjects(classId),
    enabled: options?.enabled === true && classId > 0, // ✅ OPTIMIZATION: Only fetch when explicitly enabled AND classId is valid
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: false, // ✅ OPTIMIZATION: No auto-refetch on mount - fetch on demand only
  });
};

/**
 * Hook for fetching school exams
 * 
 * ✅ OPTIMIZATION: On-demand fetching - only fetches when enabled or explicitly refetched
 */
export const useSchoolExams = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["school-dropdowns", "exams"],
    queryFn: () => SchoolDropdownsService.getExams(),
    enabled: options?.enabled === true, // ✅ OPTIMIZATION: Only fetch when explicitly enabled (on-demand)
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: false, // ✅ OPTIMIZATION: No auto-refetch on mount - fetch on demand only
  });
};

/**
 * Hook for fetching school tests
 * 
 * ✅ OPTIMIZATION: On-demand fetching - only fetches when enabled or explicitly refetched
 */
export const useSchoolTests = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["school-dropdowns", "tests"],
    queryFn: () => SchoolDropdownsService.getTests(),
    enabled: options?.enabled === true, // ✅ OPTIMIZATION: Only fetch when explicitly enabled (on-demand)
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: false, // ✅ OPTIMIZATION: No auto-refetch on mount - fetch on demand only
  });
};
