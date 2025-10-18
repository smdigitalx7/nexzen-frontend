import { Api } from "@/lib/api";
import type {
  DistanceSlabRead,
  DistanceSlabCreate,
  DistanceSlabUpdate,
  DistanceSlabListResponse,
} from "@/lib/types/general/distance-slabs";

/**
 * DistanceSlabsService - Handles all distance slab-related API operations
 * 
 * Required roles for most operations: ADMIN, INSTITUTE_ADMIN, ACCOUNTANT
 * 
 * Available endpoints:
 * - GET /transport-fee-structures - List all distance slabs
 * - GET /transport-fee-structures/{slab_id} - Get distance slab by ID
 * - POST /transport-fee-structures - Create new distance slab
 * - PUT /transport-fee-structures/{slab_id} - Update distance slab
 */
export const DistanceSlabsService = {
  /**
   * Get all distance slabs
   * @returns Promise<DistanceSlabRead[]> - List of all distance slabs
   */
  listDistanceSlabs(): Promise<DistanceSlabRead[]> {
    return Api.get<DistanceSlabRead[]>("/transport-fee-structures");
  },

  /**
   * Get a specific distance slab by ID
   * @param id - Distance slab ID
   * @returns Promise<DistanceSlabRead> - Distance slab details
   */
  getDistanceSlabById(id: number): Promise<DistanceSlabRead> {
    return Api.get<DistanceSlabRead>(`/transport-fee-structures/${id}`);
  },

  /**
   * Create a new distance slab
   * @param data - Distance slab creation data
   * @returns Promise<DistanceSlabRead> - Created distance slab
   */
  createDistanceSlab(data: DistanceSlabCreate): Promise<DistanceSlabRead> {
    return Api.post<DistanceSlabRead>("/transport-fee-structures", data);
  },

  /**
   * Update an existing distance slab
   * @param id - Distance slab ID
   * @param data - Distance slab update data
   * @returns Promise<DistanceSlabRead> - Updated distance slab
   */
  updateDistanceSlab(id: number, data: DistanceSlabUpdate): Promise<DistanceSlabRead> {
    return Api.put<DistanceSlabRead>(`/transport-fee-structures/${id}`, data);
  },

};
