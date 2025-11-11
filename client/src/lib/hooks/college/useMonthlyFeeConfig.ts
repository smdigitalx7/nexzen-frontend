import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MonthlyFeeConfigService } from "@/lib/services/college/monthly-fee-config.service";
import type {
  MonthlyFeeConfigRead,
  MonthlyFeeConfigCreate,
  MonthlyFeeConfigUpdate,
} from "@/lib/types/college/monthly-fee-config";
import { useToast } from "@/hooks/use-toast";

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
    queryFn: () => {
      // Explicitly call GET endpoint
      return MonthlyFeeConfigService.getMonthlyFeeConfig();
    },
    enabled: true, // Always enabled to fetch on mount
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (config doesn't exist yet)
      if (error?.response?.status === 404) {
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

