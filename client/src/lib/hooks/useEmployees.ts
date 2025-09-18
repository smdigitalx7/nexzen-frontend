import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EmployeesService } from "@/lib/services/employees.service";
import type { EmployeeRead, EmployeeCreate, EmployeeUpdate } from "@/lib/types/employees";
import { useToast } from "@/hooks/use-toast";

const keys = {
  institute: ["employees", "institute"] as const,
  branch: ["employees", "branch"] as const,
  detail: (id: number) => ["employees", id] as const,
};

export function useEmployeesByInstitute() {
  return useQuery<EmployeeRead[]>({ 
    queryKey: keys.institute, 
    queryFn: () => EmployeesService.listByInstitute(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useEmployeesByBranch() {
  return useQuery<EmployeeRead[]>({ 
    queryKey: keys.branch, 
    queryFn: () => EmployeesService.listByBranch(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useEmployee(id: number) {
  return useQuery<EmployeeRead>({ 
    queryKey: keys.detail(id), 
    queryFn: () => EmployeesService.getById(id), 
    enabled: Number.isFinite(id) && id > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (payload: EmployeeCreate) => EmployeesService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.institute });
      qc.invalidateQueries({ queryKey: keys.branch });
      toast({
        title: "Success",
        description: "Employee created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create employee.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EmployeeUpdate }) => 
      EmployeesService.update(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: keys.institute });
      qc.invalidateQueries({ queryKey: keys.branch });
      qc.invalidateQueries({ queryKey: keys.detail(id) });
      toast({
        title: "Success",
        description: "Employee updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update employee.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (id: number) => EmployeesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.institute });
      qc.invalidateQueries({ queryKey: keys.branch });
      toast({
        title: "Success",
        description: "Employee deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete employee.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateEmployeeStatus() {
  const qc = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      EmployeesService.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: keys.institute });
      qc.invalidateQueries({ queryKey: keys.branch });
      qc.invalidateQueries({ queryKey: keys.detail(id) });
      toast({
        title: "Success",
        description: "Employee status updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update employee status.",
        variant: "destructive",
      });
    },
  });
}


