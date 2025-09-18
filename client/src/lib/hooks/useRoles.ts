import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RolesService } from "@/lib/services/roles.service";
import type { RoleRead, RoleUpdate } from "@/lib/types/roles";

const keys = {
  all: ["roles"] as const,
  detail: (id: number) => ["roles", id] as const,
};

export function useRoles() {
  return useQuery<RoleRead[]>({ queryKey: keys.all, queryFn: () => RolesService.list() });
}

export function useRole(id: number) {
  return useQuery<RoleRead>({ queryKey: keys.detail(id), queryFn: () => RolesService.getById(id), enabled: Number.isFinite(id) });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: RoleUpdate }) => RolesService.update(id, payload),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.detail(v.id) });
    },
  });
}


