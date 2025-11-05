import { useQuery } from "@tanstack/react-query";
import { CollegeDropdownsService } from "@/lib/services/college/dropdowns.service";

/**
 * Hook for fetching college classes
 */
export const useCollegeClasses = () => {
  return useQuery({
    queryKey: ["college-dropdowns", "classes"],
    queryFn: () => CollegeDropdownsService.getClasses(),
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for fetching college groups - only fetches when a valid classId is provided
 */
export const useCollegeGroups = (classId?: number) => {
  return useQuery({
    queryKey: classId && classId > 0 ? ["college-dropdowns", "groups", classId] : ["college-dropdowns", "groups", "disabled"],
    queryFn: () => CollegeDropdownsService.getGroups(classId),
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: classId !== undefined && classId > 0, // Only fetch when classId is valid
  });
};

/**
 * Hook for fetching college courses - only fetches when a valid groupId is provided
 */
export const useCollegeCourses = (groupId: number) => {
  return useQuery({
    queryKey: groupId > 0 ? ["college-dropdowns", "courses", groupId] : ["college-dropdowns", "courses", "disabled"],
    queryFn: () => CollegeDropdownsService.getCourses(groupId),
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: groupId > 0, // Only fetch when groupId is valid
  });
};

/**
 * Hook for fetching college subjects - only fetches when a valid groupId is provided
 */
export const useCollegeSubjects = (groupId: number) => {
  return useQuery({
    queryKey: groupId > 0 ? ["college-dropdowns", "subjects", groupId] : ["college-dropdowns", "subjects", "disabled"],
    queryFn: () => CollegeDropdownsService.getSubjects(groupId),
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: groupId > 0, // Only fetch when groupId is valid
  });
};

/**
 * Hook for fetching college exams
 */
export const useCollegeExams = () => {
  return useQuery({
    queryKey: ["college-dropdowns", "exams"],
    queryFn: () => CollegeDropdownsService.getExams(),
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for fetching college tests
 */
export const useCollegeTests = () => {
  return useQuery({
    queryKey: ["college-dropdowns", "tests"],
    queryFn: () => CollegeDropdownsService.getTests(),
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
