import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ServiceLocator } from "@/core";
import type { BranchRead, BranchCreate, BranchUpdate } from "../types/branches";
import { useToast } from "@/hooks/use-toast";
import { Api } from "@/lib/api";

const keys = {
  all: ["branches"] as const,
  detail: (id: number) => ["branches", id] as const,
};

export function useBranches() {
  return useQuery<BranchRead[]>({
    queryKey: keys.all,
    queryFn: async () => {
      const branchUseCases = ServiceLocator.getBranchUseCases();
      const branches = await branchUseCases.getAllBranches();
      
      // Convert clean architecture response to legacy format
      return branches.map(branch => ({
        branch_id: branch.id,
        institute_id: 1, // Default institute
        branch_name: branch.name,
        branch_type: branch.branchType as any,
        branch_address: branch.address,
        contact_phone: branch.phone,
        contact_email: branch.email,
        is_active: branch.isActive,
        created_at: branch.createdAt,
        updated_at: branch.updatedAt,
      }));
    },
  });
}

export function useBranch(id: number) {
  return useQuery<BranchRead>({
    queryKey: keys.detail(id),
    queryFn: async () => {
      console.log(`Fetching branch ${id} with clean architecture...`);
      const branchUseCases = ServiceLocator.getBranchUseCases();
      const branch = await branchUseCases.getBranchById(id);
      
      if (!branch) {
        throw new Error('Branch not found');
      }
      
      // Convert clean architecture response to legacy format
      return {
        branch_id: branch.id,
        institute_id: 1, // Default institute
        branch_name: branch.name,
        branch_type: branch.branchType as any,
        branch_address: branch.address,
        contact_phone: branch.phone,
        contact_email: branch.email,
        is_active: branch.isActive,
        created_at: branch.createdAt,
        updated_at: branch.updatedAt,
      };
    },
    enabled: Number.isFinite(id),
  });
}

export function useCreateBranch() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: BranchCreate) => {
      console.log("Creating branch with clean architecture...");
      const branchUseCases = ServiceLocator.getBranchUseCases();
      const branch = await branchUseCases.createBranch({
        name: payload.branch_name,
        code: payload.branch_name.toLowerCase().replace(/\s+/g, '_'), // Generate code from name
        address: payload.branch_address || undefined,
        phone: payload.contact_phone || undefined,
        email: payload.contact_email || undefined,
        branchType: payload.branch_type,
      });
      
      // Convert clean architecture response to legacy format
      return {
        branch_id: branch.id,
        institute_id: 1, // Default institute
        branch_name: branch.name,
        branch_type: branch.branchType as any,
        branch_address: branch.address,
        contact_phone: branch.phone,
        contact_email: branch.email,
        is_active: branch.isActive,
        created_at: branch.createdAt,
        updated_at: branch.updatedAt,
      };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: keys.all });
      toast({ title: "Success", description: `Branch "${data.branch_name}" created.` });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create branch.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateBranch() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: BranchUpdate }) => {
      console.log(`Updating branch ${id} with clean architecture...`);
      const branchUseCases = ServiceLocator.getBranchUseCases();
      const branch = await branchUseCases.updateBranch({
        id,
        name: payload.branch_name,
        code: payload.branch_name.toLowerCase().replace(/\s+/g, '_'), // Generate code from name
        address: payload.branch_address || undefined,
        phone: payload.contact_phone || undefined,
        email: payload.contact_email || undefined,
        branchType: payload.branch_type,
        isActive: payload.is_active,
      });
      
      // Convert clean architecture response to legacy format
      return {
        branch_id: branch.id,
        institute_id: 1, // Default institute
        branch_name: branch.name,
        branch_type: branch.branchType as any,
        branch_address: branch.address,
        contact_phone: branch.phone,
        contact_email: branch.email,
        is_active: branch.isActive,
        created_at: branch.createdAt,
        updated_at: branch.updatedAt,
      };
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.detail(variables.id) });
      toast({ title: "Success", description: `Branch updated.` });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update branch.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteBranch() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      console.log(`Deleting branch ${id} with clean architecture...`);
      const branchUseCases = ServiceLocator.getBranchUseCases();
      await branchUseCases.deleteBranch(id);
      
      // Return mock response for compatibility
      return {
        branch_id: id,
        institute_id: 1, // Default institute
        branch_name: 'Deleted Branch',
        branch_type: 'SCHOOL' as any,
        branch_address: null,
        contact_phone: null,
        contact_email: null,
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      toast({ title: "Success", description: `Branch deleted.` });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete branch.",
        variant: "destructive",
      });
    },
  });
}