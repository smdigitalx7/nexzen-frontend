import { useQuery } from "@tanstack/react-query";
import { SchoolDropdownsService } from "@/lib/services/school/dropdowns.service";

/**
 * Hook for fetching school classes
 */
export const useSchoolClasses = () => {
  return useQuery({
    queryKey: ["school-dropdowns", "classes"],
    queryFn: () => SchoolDropdownsService.getClasses(),
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for fetching school sections - only fetches when a valid classId is provided
 */
export const useSchoolSections = (classId: number) => {
  return useQuery({
    queryKey: classId > 0 ? ["school-dropdowns", "sections", classId] : ["school-dropdowns", "sections", "disabled"],
    queryFn: () => SchoolDropdownsService.getSections(classId),
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: classId > 0, // Only fetch when classId is valid
  });
};

/**
 * Hook for fetching school subjects - only fetches when a valid classId is provided
 */
export const useSchoolSubjects = (classId: number) => {
  return useQuery({
    queryKey: classId > 0 ? ["school-dropdowns", "subjects", classId] : ["school-dropdowns", "subjects", "disabled"],
    queryFn: () => SchoolDropdownsService.getSubjects(classId),
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: classId > 0, // Only fetch when classId is valid
  });
};

/**
 * Hook for fetching school exams
 */
export const useSchoolExams = () => {
  return useQuery({
    queryKey: ["school-dropdowns", "exams"],
    queryFn: () => SchoolDropdownsService.getExams(),
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for fetching school tests
 */
export const useSchoolTests = () => {
  return useQuery({
    queryKey: ["school-dropdowns", "tests"],
    queryFn: () => SchoolDropdownsService.getTests(),
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
