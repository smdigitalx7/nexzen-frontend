import { useQuery } from "@tanstack/react-query";
import { CollegeDropdownsService } from "@/lib/services/college/dropdowns.service";

/**
 * Hook for fetching college classes
 * 
 * ✅ OPTIMIZATION: On-demand fetching - only fetches when enabled or explicitly refetched
 */
export const useCollegeClasses = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["college-dropdowns", "classes"],
    queryFn: () => CollegeDropdownsService.getClasses(),
    enabled: options?.enabled === true, // ✅ OPTIMIZATION: Only fetch when explicitly enabled (on-demand)
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: false, // ✅ OPTIMIZATION: No auto-refetch on mount - fetch on demand only
  });
};

/**
 * Hook for fetching college groups - fetches all groups if classId is undefined, or filtered by classId if provided
 * 
 * ✅ OPTIMIZATION: On-demand fetching - only fetches when enabled or explicitly refetched
 */
export const useCollegeGroups = (classId?: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: classId && classId > 0 ? ["college-dropdowns", "groups", classId] : ["college-dropdowns", "groups"],
    queryFn: () => CollegeDropdownsService.getGroups(classId),
    enabled: options?.enabled === true && (classId === undefined || classId > 0), // ✅ OPTIMIZATION: Only fetch when explicitly enabled AND classId is valid or undefined
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: false, // ✅ OPTIMIZATION: No auto-refetch on mount - fetch on demand only
  });
};

/**
 * Hook for fetching college courses - only fetches when a valid groupId is provided
 * 
 * ✅ OPTIMIZATION: On-demand fetching - only fetches when enabled or explicitly refetched
 */
export const useCollegeCourses = (groupId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: groupId > 0 ? ["college-dropdowns", "courses", groupId] : ["college-dropdowns", "courses", "disabled"],
    queryFn: () => CollegeDropdownsService.getCourses(groupId),
    enabled: options?.enabled === true && groupId > 0, // ✅ OPTIMIZATION: Only fetch when explicitly enabled AND groupId is valid
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: false, // ✅ OPTIMIZATION: No auto-refetch on mount - fetch on demand only
  });
};

/**
 * Hook for fetching college subjects - only fetches when a valid groupId is provided
 * 
 * ✅ OPTIMIZATION: On-demand fetching - only fetches when enabled or explicitly refetched
 */
export const useCollegeSubjects = (groupId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: groupId > 0 ? ["college-dropdowns", "subjects", groupId] : ["college-dropdowns", "subjects", "disabled"],
    queryFn: () => CollegeDropdownsService.getSubjects(groupId),
    enabled: options?.enabled === true && groupId > 0, // ✅ OPTIMIZATION: Only fetch when explicitly enabled AND groupId is valid
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: false, // ✅ OPTIMIZATION: No auto-refetch on mount - fetch on demand only
  });
};

/**
 * Hook for fetching college exams
 * 
 * ✅ OPTIMIZATION: On-demand fetching - only fetches when enabled or explicitly refetched
 */
export const useCollegeExams = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["college-dropdowns", "exams"],
    queryFn: () => CollegeDropdownsService.getExams(),
    enabled: options?.enabled === true, // ✅ OPTIMIZATION: Only fetch when explicitly enabled (on-demand)
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: false, // ✅ OPTIMIZATION: No auto-refetch on mount - fetch on demand only
  });
};

/**
 * Hook for fetching college tests
 * 
 * ✅ OPTIMIZATION: On-demand fetching - only fetches when enabled or explicitly refetched
 */
export const useCollegeTests = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["college-dropdowns", "tests"],
    queryFn: () => CollegeDropdownsService.getTests(),
    enabled: options?.enabled === true, // ✅ OPTIMIZATION: Only fetch when explicitly enabled (on-demand)
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: false, // ✅ OPTIMIZATION: No auto-refetch on mount - fetch on demand only
  });
};
