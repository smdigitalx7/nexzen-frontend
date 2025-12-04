import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { LogosService } from "@/features/general/services/logos.service";
import type { LogoType, LogoUploadRequest } from "@/features/general/types/logos";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";
import { useToast } from "@/common/hooks/use-toast";

/**
 * Hook to get logo status for a branch
 */
export function useLogoStatus(branchId: number | null | undefined) {
  return useQuery({
    queryKey: ["logos", "status", branchId],
    queryFn: () => LogosService.getStatus(branchId!),
    enabled: typeof branchId === "number" && branchId > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to list all logos for a branch
 */
export function useLogos(branchId: number | null | undefined) {
  return useQuery({
    queryKey: ["logos", "list", branchId],
    queryFn: () => LogosService.list(branchId!),
    enabled: typeof branchId === "number" && branchId > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to upload a logo
 */
export function useUploadLogo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutationWithSuccessToast(
    {
      mutationFn: (payload: LogoUploadRequest) => LogosService.upload(payload),
      onSuccess: (_, variables) => {
        // Invalidate logo-related queries
        queryClient.invalidateQueries({ queryKey: ["logos", "status", variables.branch_id] });
        queryClient.invalidateQueries({ queryKey: ["logos", "list", variables.branch_id] });
        queryClient.refetchQueries({ queryKey: ["logos"] });
      },
    },
    "Logo uploaded successfully"
  );
}

/**
 * Hook to delete a logo
 */
export function useDeleteLogo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutationWithSuccessToast(
    {
      mutationFn: ({ branchId, logoType }: { branchId: number; logoType: LogoType }) =>
        LogosService.delete(branchId, logoType),
      onSuccess: (_, variables) => {
        // Invalidate logo-related queries
        queryClient.invalidateQueries({ queryKey: ["logos", "status", variables.branchId] });
        queryClient.invalidateQueries({ queryKey: ["logos", "list", variables.branchId] });
        queryClient.refetchQueries({ queryKey: ["logos"] });
      },
    },
    "Logo deleted successfully"
  );
}



