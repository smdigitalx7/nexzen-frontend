import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserBranchAccessService } from "@/lib/services/userBranchAccess.service";
import type { UserBranchAccessRead, UserBranchAccessCreate, UserBranchRevoke } from "@/lib/types/userBranchAccess";
import { useToast } from "@/hooks/use-toast";

const keys = {
  all: ["user-branch-accesses"] as const,
  detail: (id: number) => ["user-branch-accesses", id] as const,
};

export function useUserBranchAccesses() {
  return useQuery<UserBranchAccessRead[]>({ 
    queryKey: keys.all, 
    queryFn: async () => {
      console.log("Fetching user branch accesses...");
      const result = await UserBranchAccessService.list();
      console.log("User branch accesses result:", result);
      return result;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUserBranchAccess(id: number) {
  return useQuery<UserBranchAccessRead>({ 
    queryKey: keys.detail(id), 
    queryFn: async () => {
      console.log(`Fetching user branch access ${id}...`);
      const result = await UserBranchAccessService.getById(id);
      console.log(`User branch access ${id} result:`, result);
      return result;
    },
    enabled: Number.isFinite(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateUserBranchAccess() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: UserBranchAccessCreate) => UserBranchAccessService.create(payload),
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
        description: error.message || "Failed to create user branch access.",
        variant: "destructive",
      });
    },
  });
}

export function useRevokeUserBranchAccess() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UserBranchRevoke }) => 
      UserBranchAccessService.revoke(id, payload),
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
        description: error.message || "Failed to revoke user branch access.",
        variant: "destructive",
      });
    },
  });
}
