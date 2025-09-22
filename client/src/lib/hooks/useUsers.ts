import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UsersService } from "@/lib/services/users.service";
import type { UserRead, UserCreate, UserUpdate, UserWithRolesAndBranches } from "@/lib/types/users";
import { useToast } from "@/hooks/use-toast";

const keys = {
  all: ["users"] as const,
  allWithRoles: ["users", "with-roles"] as const,
  detail: (id: number) => ["users", id] as const,
};

export function useUsers() {
  return useQuery<UserRead[]>({ 
    queryKey: keys.all, 
    queryFn: async () => {
      console.log("Fetching users...");
      const result = await UsersService.list();
      console.log("Users result:", result);
      return result;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUsersWithRoles() {
  return useQuery<UserWithRolesAndBranches[]>({ 
    queryKey: keys.allWithRoles, 
    queryFn: async () => {
      console.log("Fetching users with roles and branches...");
      const result = await UsersService.listWithRolesAndBranches();
      console.log("Users with roles result:", result);
      return result;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUser(id: number) {
  return useQuery<UserRead>({ 
    queryKey: keys.detail(id), 
    queryFn: async () => {
      console.log(`Fetching user ${id}...`);
      const result = await UsersService.getById(id);
      console.log(`User ${id} result:`, result);
      return result;
    },
    enabled: Number.isFinite(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: UserCreate) => UsersService.create(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.allWithRoles });
      toast({
        title: "Success",
        description: `User "${data.full_name}" created successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UserUpdate }) => UsersService.update(id, payload),
    onSuccess: (data, { id }) => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.allWithRoles });
      qc.invalidateQueries({ queryKey: keys.detail(id) });
      toast({
        title: "Success",
        description: `User "${data.full_name}" updated successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => UsersService.remove(id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.allWithRoles });
      toast({
        title: "Success",
        description: `User "${data.full_name}" deleted successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      UsersService.update(id, { is_active }),
    onSuccess: (data, { id }) => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.allWithRoles });
      qc.invalidateQueries({ queryKey: keys.detail(id) });
      toast({
        title: "Success",
        description: `User "${data.full_name}" status updated successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status.",
        variant: "destructive",
      });
    },
  });
}


