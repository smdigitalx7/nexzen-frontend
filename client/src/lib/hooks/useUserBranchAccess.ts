import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ServiceLocator } from "@/core";
import { QUERY_STALE_TIME } from "@/lib/constants/query";
import type { UserBranchAccessRead, UserBranchAccessCreate, UserBranchRevoke } from "../types/userBranchAccess";
import { useToast } from "@/hooks/use-toast";

const keys = {
  all: ["user-branch-accesses"] as const,
  detail: (id: number) => ["user-branch-accesses", id] as const,
};

export function useUserBranchAccesses() {
  return useQuery<UserBranchAccessRead[]>({ 
    queryKey: keys.all, 
    queryFn: async () => {
      const accessUseCases = ServiceLocator.getUserBranchAccessUseCases();
      const accesses = await accessUseCases.getAllUserBranchAccesses();
      
      // Convert clean architecture response to legacy format
      return accesses.map((access: any) => ({
        access_id: access.id,
        user_id: access.userId,
        institute_id: 1, // Default institute ID
        branch_id: access.branchId,
        role_id: access.roleId,
        granted_by: undefined,
        revoked_by: undefined,
        access_notes: undefined,
        granted_at: new Date().toISOString(),
        revoked_at: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_default: false,
        is_active: false,
      }));
    },
    staleTime: QUERY_STALE_TIME, // 5 minutes
  });
}

export function useUserBranchAccess(id: number) {
  return useQuery<UserBranchAccessRead>({ 
    queryKey: keys.detail(id), 
    queryFn: async () => {
      const accessUseCases = ServiceLocator.getUserBranchAccessUseCases();
      const access = await accessUseCases.getUserBranchAccessById(id);
      
      if (!access) {
        throw new Error('User branch access not found');
      }
      
      // Convert clean architecture response to legacy format
      return {
        access_id: access.id,
        user_id: access.userId,
        institute_id: 1, // Default institute ID
        branch_id: access.branchId,
        role_id: access.roleId,
        granted_by: undefined,
        revoked_by: undefined,
        access_notes: undefined,
        granted_at: new Date().toISOString(),
        revoked_at: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_default: false,
        is_active: false,
      };
    },
    enabled: Number.isFinite(id),
    staleTime: QUERY_STALE_TIME, // 5 minutes
  });
}

export function useCreateUserBranchAccess() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: UserBranchAccessCreate) => {
      console.log("Creating user branch access with clean architecture...");
      const userBranchAccessUseCases = ServiceLocator.getUserBranchAccessUseCases();
      const access = await userBranchAccessUseCases.createUserBranchAccess({
        userId: payload.user_id,
        branchId: payload.branch_id,
        roleId: payload.role_id,
        isDefault: payload.is_default,
        isActive: payload.is_active,
      });
      
      // Return the response data directly
      return access;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: ["users", "with-roles"] }); // Also invalidate users with roles
      toast({
        title: "Success",
        description: `User branch access created successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user branch null.",
        variant: "destructive",
      });
    },
  });
}

export function useRevokeUserBranchAccess() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: UserBranchRevoke }) => {
      console.log(`Revoking user branch access ${id} with clean architecture...`);
      const userBranchAccessUseCases = ServiceLocator.getUserBranchAccessUseCases();
      await userBranchAccessUseCases.deleteUserBranchAccess(id);
      
      // Return mock response for compatibility
      return {
        access_id: id,
        user_id: 0,
        institute_id: 1, // Default institute ID
        branch_id: 0,
        role_id: 0,
        granted_by: null,
        revoked_by: null,
        access_notes: payload.access_notes || null,
        granted_at: new Date().toISOString(),
        revoked_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_default: false,
        is_active: false,
      };
    },
    onSuccess: (data, { id }) => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.detail(id) });
      qc.invalidateQueries({ queryKey: ["users", "with-roles"] }); // Also invalidate users with roles
      toast({
        title: "Success",
        description: `User branch access revoked successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke user branch null.",
        variant: "destructive",
      });
    },
  });
}
