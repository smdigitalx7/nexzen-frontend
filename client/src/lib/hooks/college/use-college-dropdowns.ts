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
 * Hook for fetching college groups
 */
export const useCollegeGroups = (classId?: number) => {
  return useQuery({
    queryKey: ["college-dropdowns", "groups", classId],
    queryFn: () => CollegeDropdownsService.getGroups(classId),
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for fetching college courses
 */
export const useCollegeCourses = (groupId: number) => {
  return useQuery({
    queryKey: ["college-dropdowns", "courses", groupId],
    queryFn: () => CollegeDropdownsService.getCourses(groupId),
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!groupId,
  });
};

/**
 * Hook for fetching college subjects
 */
export const useCollegeSubjects = (groupId: number) => {
  return useQuery({
    queryKey: ["college-dropdowns", "subjects", groupId],
    queryFn: () => CollegeDropdownsService.getSubjects(groupId),
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!groupId,
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
