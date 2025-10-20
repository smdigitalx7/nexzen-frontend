import { useQuery } from "@tanstack/react-query";
import { SchoolClassesService } from "@/lib/services/school/classes.service";
import type { SchoolClassRead } from "@/lib/types/school";

/**
 * Hook for fetching a specific school class by ID
 */
export const useSchoolClass = (classId: number | null) => {
  const {
    data: classData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["school-class", classId],
    queryFn: () => SchoolClassesService.getById(classId!),
    enabled: !!classId,
  });

  return {
    classData,
    isLoading,
    error,
    refetch,
  };
};
