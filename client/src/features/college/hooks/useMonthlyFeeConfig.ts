import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MonthlyFeeConfigService } from "@/features/college/services/monthly-fee-config.service";
import type {
  MonthlyFeeConfigRead,
  MonthlyFeeConfigCreate,
  MonthlyFeeConfigUpdate,
} from "@/features/college/types/monthly-fee-config";
import { useToast } from "@/common/hooks/use-toast";

/**
 * Hook for managing monthly fee config (College only)
 */
export const useMonthlyFeeConfig = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get monthly fee config - always fetch on mount
  const {
    data: monthlyFeeConfig,
    isLoading: isLoadingMonthlyFeeConfig,
    error: monthlyFeeConfigError,
    refetch: refetchMonthlyFeeConfig,
  } = useQuery({
    queryKey: ["college", "monthly-fee-config"],
    queryFn: async () => {
      try {
        // Explicitly call GET endpoint
        return await MonthlyFeeConfigService.getMonthlyFeeConfig();
      } catch (error: unknown) {
        // Handle 404 errors by returning null (config doesn't exist yet)
        if (import.meta.env.DEV) {
          console.log("Monthly fee config API error:", error);
        }
        // Api class attaches status property to Error objects
        if (error instanceof Error) {
          const apiError = error as Error & { status?: number; data?: { detail?: string } };
          if (apiError.status === 404) {
            return null; // Return null instead of throwing for 404
          }
        }
        // Fallback check for other error formats
        const errorObj = error as { message?: string; status?: number; response?: { status?: number } };
        if (
          errorObj?.status === 404 ||
          errorObj?.response?.status === 404 ||
          errorObj?.message?.includes("404") ||
          errorObj?.message?.includes("Not Found")
        ) {
          return null; // Return null instead of throwing for 404
        }
        throw error; // Re-throw other errors
      }
    },
    enabled: true, // Always enabled to fetch on mount
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (config doesn't exist yet)
      if (error?.status === 404 || error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Create monthly fee config mutation
  const createMonthlyFeeConfigMutation = useMutation({
    mutationFn: (data: MonthlyFeeConfigCreate) =>
      MonthlyFeeConfigService.createMonthlyFeeConfig(data),
    onSuccess: async () => {
      // Invalidate and refetch to refresh UI
      await queryClient.invalidateQueries({ queryKey: ["college", "monthly-fee-config"] });
      await refetchMonthlyFeeConfig();
      toast({
        title: "Success",
        description: "Monthly fee config created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to create monthly fee config",
        variant: "destructive",
      });
    },
  });

  // Update monthly fee config mutation (upsert)
  const updateMonthlyFeeConfigMutation = useMutation({
    mutationFn: (data: MonthlyFeeConfigUpdate) =>
      MonthlyFeeConfigService.updateMonthlyFeeConfig(data),
    onSuccess: async () => {
      // Invalidate and refetch to refresh UI
      await queryClient.invalidateQueries({ queryKey: ["college", "monthly-fee-config"] });
      await refetchMonthlyFeeConfig();
      toast({
        title: "Success",
        variant: "success",
        description: "Monthly fee config updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to update monthly fee config",
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    monthlyFeeConfig,
    isLoadingMonthlyFeeConfig,
    monthlyFeeConfigError,
    refetchMonthlyFeeConfig,
    // Mutations
    createMonthlyFeeConfig: createMonthlyFeeConfigMutation,
    updateMonthlyFeeConfig: updateMonthlyFeeConfigMutation,
  };
};

