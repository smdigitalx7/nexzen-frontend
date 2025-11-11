/**
 * Monthly Fee Config Types
 * 
 * Types for monthly fee configuration API endpoints (College only)
 * Base path: /api/v1/college/monthly-fee-config
 */

export interface MonthlyFeeConfigRead {
  id: number;
  branch_id: number;
  fee_amount: number;
  created_by?: number;
  updated_by?: number;
}

export interface MonthlyFeeConfigCreate {
  fee_amount: number;
}

export interface MonthlyFeeConfigUpdate {
  fee_amount: number;
}

