import { useQuery } from "@tanstack/react-query";
import { DropdownsService } from "@/lib/services/general/dropdowns.service";

/**
 * Hook for public dropdowns
 */
export const useDropdowns = () => {
  // Get all public dropdown enums
  const {
    data: dropdowns,
    isLoading: isLoadingDropdowns,
    error: dropdownsError,
    refetch: refetchDropdowns,
  } = useQuery({
    queryKey: ["dropdowns", "public"],
    queryFn: () => DropdownsService.getPublicDropdowns(),
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    // Data
    dropdowns,
    isLoadingDropdowns,
    dropdownsError,
    
    // Actions
    refetchDropdowns,
  };
};
