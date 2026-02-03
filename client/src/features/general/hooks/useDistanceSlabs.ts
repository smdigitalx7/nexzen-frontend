import { useQuery, useMutation } from "@tanstack/react-query";
import { DistanceSlabsService } from "@/features/general/services/distance-slabs.service";
import type {
  DistanceSlabRead,
  DistanceSlabCreate,
  DistanceSlabUpdate,
} from "@/features/general/types/distance-slabs";
import { useGlobalRefetch } from "@/common/hooks/useGlobalRefetch";

/**
 * Hook for managing distance slabs
 */
export const useDistanceSlabs = () => {
  const { invalidateEntity } = useGlobalRefetch();

  // Get all distance slabs
  const {
    data: distanceSlabs,
    isLoading: isLoadingDistanceSlabs,
    error: distanceSlabsError,
    refetch: refetchDistanceSlabs,
  } = useQuery({
    queryKey: ["distance-slabs"],
    queryFn: () => DistanceSlabsService.listDistanceSlabs(),
  });

  // Get distance slab by ID
  const useDistanceSlabById = (id: number) => {
    return useQuery({
      queryKey: ["distance-slabs", id],
      queryFn: () => DistanceSlabsService.getDistanceSlabById(id),
      enabled: !!id,
    });
  };

  // Create distance slab mutation
  const createDistanceSlabMutation = useMutation({
    mutationFn: (data: DistanceSlabCreate) =>
      DistanceSlabsService.createDistanceSlab(data),
    onSuccess: () => {
      invalidateEntity("distanceSlabs");
    },
  });

  // Update distance slab mutation
  const updateDistanceSlabMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: DistanceSlabUpdate }) =>
      DistanceSlabsService.updateDistanceSlab(id, data),
    onSuccess: () => {
      invalidateEntity("distanceSlabs");
    },
  });


  return {
    // Data
    distanceSlabs,
    isLoadingDistanceSlabs,
    distanceSlabsError,
    
    // Actions
    refetchDistanceSlabs,
    useDistanceSlabById,
    
    // Mutations
    createDistanceSlab: createDistanceSlabMutation.mutateAsync,
    updateDistanceSlab: updateDistanceSlabMutation.mutateAsync,

    // Full mutation objects (needed by some UI components)
    createDistanceSlabMutation,
    updateDistanceSlabMutation,
    
    // Mutation states
    isCreatingDistanceSlab: createDistanceSlabMutation.isPending,
    isUpdatingDistanceSlab: updateDistanceSlabMutation.isPending,
  };
};
