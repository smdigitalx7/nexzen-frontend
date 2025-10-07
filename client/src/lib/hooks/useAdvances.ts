import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ServiceLocator } from "@/core";
import { QUERY_STALE_TIME } from "@/lib/constants/query";
import type { AdvanceRead, AdvanceCreate, AdvanceUpdate, AdvanceListResponse } from "@/lib/types/advances";

const keys = {
  all: ["advances", "all"] as const,
  branch: ["advances", "branch"] as const,
  detail: (id: number) => ["advances", id] as const,
};

export function useAdvancesAll() {
  return useQuery<AdvanceListResponse>({ 
    queryKey: keys.all, 
    queryFn: async () => {
      const advanceUseCases = ServiceLocator.getAdvanceUseCases();
      const advanceListResponse = await advanceUseCases.getAllAdvances();
      
      // Clean architecture already returns the correct format
      return advanceListResponse;
    },
    staleTime: QUERY_STALE_TIME, // 5 minutes
  });
}

export function useAdvancesByBranch(branchId: number = 1) {
  return useQuery<AdvanceListResponse>({ 
    queryKey: keys.branch, 
    queryFn: async () => {
      try {
        console.log("🔍 useAdvancesByBranch: Starting to fetch advances...");
        const advanceUseCases = ServiceLocator.getAdvanceUseCases();
        const advanceListResponse = await advanceUseCases.getAdvancesByBranch(branchId);
        console.log("🔍 useAdvancesByBranch: Got advances:", advanceListResponse?.data?.length || 0, 'records');
        console.log("🔍 useAdvancesByBranch: Raw advances data:", advanceListResponse);
        
        // Clean architecture already returns the correct format
        return advanceListResponse;
      } catch (error) {
        console.error("❌ useAdvancesByBranch: Error fetching advances:", error);
        throw error;
      }
    },
    staleTime: QUERY_STALE_TIME, // 5 minutes
  });
}

export function useAdvance(id: number) {
  return useQuery<AdvanceRead>({ 
    queryKey: keys.detail(id), 
    queryFn: async () => {
      const advanceUseCases = ServiceLocator.getAdvanceUseCases();
      const advance = await advanceUseCases.getAdvanceById(id);
      
      if (!advance) {
        throw new Error('Advance not found');
      }
      
      // Clean architecture already returns the correct format
      return advance;
    }, 
    enabled: Number.isFinite(id),
    staleTime: QUERY_STALE_TIME, // 5 minutes
  });
}

export function useCreateAdvance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AdvanceCreate) => {
      const advanceUseCases = ServiceLocator.getAdvanceUseCases();
      const advance = await advanceUseCases.createAdvance({
        employeeId: payload.employee_id,
        amount: payload.advance_amount, // Use backend field name
        reason: payload.request_reason, // Use backend field name
        branchId: 1, // Default branch
      });
      
      // Clean architecture already returns the correct format
      return advance;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.branch });
    },
  });
}

export function useUpdateAdvance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: AdvanceUpdate }) => {
      const advanceUseCases = ServiceLocator.getAdvanceUseCases();
      const advance = await advanceUseCases.updateAdvance({
        id,
        amount: payload.advance_amount, // Use backend field name
      });
      
      // Clean architecture already returns the correct format
      return advance;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.branch });
      qc.invalidateQueries({ queryKey: keys.detail(v.id) });
    },
  });
}

export function useUpdateAdvanceStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      console.log(`Updating advance status ${id} with clean architecture...`);
      const advanceUseCases = ServiceLocator.getAdvanceUseCases();
      const advance = await advanceUseCases.updateAdvanceStatus({
        id,
        status: status as any,
        notes: undefined,
      });
      
      // Return the response data directly
      return advance;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.branch });
      qc.invalidateQueries({ queryKey: keys.detail(v.id) });
    },
  });
}

export function useUpdateAdvanceAmountPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, amount_paid }: { id: number; amount_paid: number }) => {
      console.log(`Updating advance amount paid ${id} with clean architecture...`);
      const advanceUseCases = ServiceLocator.getAdvanceUseCases();
      const advance = await advanceUseCases.updateAdvanceAmountPaid({
        id,
        amountPaid: amount_paid,
        notes: undefined,
      });
      
      // Return the response data directly
      return advance;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.branch });
      qc.invalidateQueries({ queryKey: keys.detail(v.id) });
    },
  });
}


