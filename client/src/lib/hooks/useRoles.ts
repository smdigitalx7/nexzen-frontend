import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ServiceLocator } from "@/core";
import type { RoleRead, RoleUpdate } from "@/lib/types/roles";
import { useToast } from "@/hooks/use-toast";
import { Api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const keys = {
  all: ["roles"] as const,
  detail: (id: number) => ["roles", id] as const,
};

export function useRoles() {
  return useQuery<RoleRead[]>({
    queryKey: keys.all,
    queryFn: async () => {
      try {
        // Check current user authentication state
        const authState = useAuthStore.getState();
        console.log('🔍 useRoles: Current auth state:', {
          isAuthenticated: authState.isAuthenticated,
          hasToken: !!authState.token,
          userRole: authState.user?.role,
          userId: authState.user?.user_id,
          instituteId: authState.user?.institute_id
        });
        
        // Directly fetch roles - the backend will handle authentication and authorization
        // Note: Backend expects trailing slash for /roles endpoint
        const roles = await Api.get('/roles/') as RoleRead[];
        
        console.log('✅ useRoles: Successfully fetched roles:', roles.length, 'roles');
        console.log('📊 useRoles: Sample role data:', roles[0]);
        
        // Backend already returns the correct structure, no transformation needed
        return roles;
      } catch (error: any) {
        // Handle specific error cases
        if (error.message === 'Not authenticated') {
          throw new Error('Session expired. Please log in again.');
        }
        if (error.message?.includes('Access denied') || error.message?.includes('required roles')) {
          throw new Error('You do not have permission to view roles. Required: INSTITUTE_ADMIN or ADMIN role.');
        }
        throw new Error(`Failed to fetch roles: ${error.message}`);
      }
    }
  });
}

export function useRole(id: number) {
  return useQuery<RoleRead>({ 
    queryKey: keys.detail(id), 
    queryFn: async () => {
      console.log(`Fetching role ${id} using simple API...`);
      const role = await Api.get(`/roles/${id}`) as RoleRead;
      
      if (!role) {
        throw new Error('Role not found');
      }
      
      // Backend already returns the correct structure, no transformation needed
      return role;
    }, 
    enabled: Number.isFinite(id) 
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: RoleUpdate }) => {
      console.log(`Updating role ${id} using simple API...`);
      const response = await Api.put(`/roles/${id}`, payload) as any;
      
      // Return the response data directly
      return response;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.detail(v.id) });
      toast({ title: "Success", description: `Role updated.` });
    },
  });
}


