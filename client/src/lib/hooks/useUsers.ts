import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ServiceLocator } from "@/core";
import type { UserRead, UserCreate, UserUpdate, UserWithRolesAndBranches } from "@/lib/types/users";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import { CreateUserRequest, UpdateUserRequest } from "@/core/application/dto/UserDto";
import { UserRole } from "@/core/domain/entities/User";

const keys = {
  all: ["users"] as const,
  allWithRoles: ["users", "with-roles"] as const,
  detail: (id: number) => ["users", id] as const,
};

export function useUsers() {
  return useQuery<UserRead[]>({ 
    queryKey: keys.all, 
    queryFn: async () => {
      const userUseCases = ServiceLocator.getUserUseCases();
      const users = await userUseCases.getAllUsers();
      
      // Clean architecture already returns the correct format
      return users;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUsersWithRoles() {
  return useQuery<UserWithRolesAndBranches[]>({ 
    queryKey: keys.allWithRoles, 
    queryFn: async () => {
      try {
        console.log('🔍 useUsersWithRoles: Starting to fetch users with roles...');
        
        // Check current user authentication state
        const authState = useAuthStore.getState();
        console.log('🔍 useUsersWithRoles: Current auth state:', {
          isAuthenticated: authState.isAuthenticated,
          hasToken: !!authState.token,
          userRole: authState.user?.role,
          userId: authState.user?.user_id,
          instituteId: authState.user?.institute_id
        });
        
        const userUseCases = ServiceLocator.getUserUseCases();
        const users = await userUseCases.getAllUsersWithRolesAndBranches();
        
        console.log('✅ useUsersWithRoles: Successfully fetched users:', users.length, 'users');
        console.log('📊 useUsersWithRoles: Sample user data:', users[0]);
        
        if (users.length === 0) {
          console.warn('⚠️ useUsersWithRoles: No users found in database');
        }
        
        // Backend already returns the correct structure, no transformation needed
        return users;
      } catch (error: any) {
        console.error('❌ useUsersWithRoles: Error fetching users:', error);
        
        // Handle specific error cases
        if (error.message === 'Not authenticated') {
          throw new Error('Session expired. Please log in again.');
        }
        if (error.message?.includes('Access denied') || error.message?.includes('required roles')) {
          throw new Error('You do not have permission to view users. Required: INSTITUTE_ADMIN or ADMIN role.');
        }
        throw new Error(`Failed to fetch users: ${error.message}`);
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUser(id: number) {
  return useQuery<UserRead>({ 
    queryKey: keys.detail(id), 
    queryFn: async () => {
      const userUseCases = ServiceLocator.getUserUseCases();
      const user = await userUseCases.getUserById(id);
      
      // Clean architecture already returns the correct format
      return user;
    },
    enabled: Number.isFinite(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: UserCreate) => {
      const userUseCases = ServiceLocator.getUserUseCases();
      const cleanArchRequest: CreateUserRequest = {
        fullName: payload.full_name,
        email: payload.email,
        role: payload.is_institute_admin ? UserRole.INSTITUTE_ADMIN : UserRole.ACADEMIC,
        password: payload.password,
        confirmPassword: payload.confirm_password,
      };
      const result = await userUseCases.createUser(cleanArchRequest);
      
      // Clean architecture already returns the correct format
      return result;
    },
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
    mutationFn: async ({ id, payload }: { id: number; payload: UserUpdate }) => {
      const userUseCases = ServiceLocator.getUserUseCases();
      const cleanArchRequest: UpdateUserRequest = {
        fullName: payload.full_name,
        email: payload.email,
        role: payload.is_institute_admin ? UserRole.INSTITUTE_ADMIN : UserRole.ACADEMIC,
        isActive: payload.is_active,
      };
      const result = await userUseCases.updateUser(id, cleanArchRequest);
      
      // Clean architecture already returns the correct format
      return result;
    },
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
    mutationFn: async (id: number) => {
      const userUseCases = ServiceLocator.getUserUseCases();
      await userUseCases.deleteUser(id);
      
      // Return mock response for compatibility
      return {
        user_id: id,
        full_name: 'Deleted User',
        email: 'deleted@example.com',
        mobile_no: null,
        is_institute_admin: false,
        is_active: false,
        institute_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: null,
        updated_by: null,
      };
    },
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
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
      const userUseCases = ServiceLocator.getUserUseCases();
      const result = await userUseCases.updateUserStatus(id, is_active);
      
      // Clean architecture already returns the correct format
      return result;
    },
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


