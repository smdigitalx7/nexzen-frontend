import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DistanceSlabsService } from "@/lib/services/general/distance-slabs.service";
import type {
  DistanceSlabRead,
  DistanceSlabCreate,
  DistanceSlabUpdate,
} from "@/lib/types/general/distance-slabs";

/**
 * Hook for managing distance slabs
 */
export const useDistanceSlabs = () => {
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ["distance-slabs"] });
    },
  });

  // Update distance slab mutation
  const updateDistanceSlabMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: DistanceSlabUpdate }) =>
      DistanceSlabsService.updateDistanceSlab(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distance-slabs"] });
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
    
    // Mutation states
    isCreatingDistanceSlab: createDistanceSlabMutation.isPending,
    isUpdatingDistanceSlab: updateDistanceSlabMutation.isPending,
  };
};
