import { useQuery } from "@tanstack/react-query";
import { DropdownsService } from "@/features/general/services/dropdowns.service";

/**
 * Hook for public dropdowns
 * 
 * ✅ OPTIMIZATION: Made on-demand - no auto-fetch
 * Dropdowns should only fetch when explicitly needed (e.g., when dropdown is opened)
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
    enabled: false, // ✅ OPTIMIZATION: On-demand only - call refetchDropdowns() when needed
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
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
