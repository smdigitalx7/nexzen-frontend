/**
 * Distance Slabs Types
 * 
 * Types for distance slab management API endpoints
 * Base path: /api/v1/transport-fee-structures
 */

export interface DistanceSlabRead {
  slab_id: number;
  slab_name: string;
  min_distance: number;
  max_distance?: number;
  fee_amount: number;
}

export interface DistanceSlabCreate {
  slab_name: string;
  min_distance: number;
  max_distance?: number;
  fee_amount: number;
}

export interface DistanceSlabUpdate {
  slab_name?: string;
  min_distance?: number;
  max_distance?: number;
  fee_amount?: number;
}

export interface DistanceSlabListResponse {
  items: DistanceSlabRead[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
