import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PayrollsService } from "@/lib/services/payrolls.service";
import type { PayrollRead, PayrollCreate, PayrollUpdate, PayrollQuery, PayrollListResponse } from "@/lib/types/payrolls";
import { useToast } from "@/hooks/use-toast";

const keys = {
  list: (query?: PayrollQuery) => ["payrolls", query || {}] as const,
  branch: (branch_id: number, query?: PayrollQuery) => ["payrolls", "branch", branch_id, query || {}] as const,
  detail: (id: number) => ["payrolls", id] as const,
};

export function usePayrolls(query?: PayrollQuery) {
  return useQuery<PayrollListResponse>({ queryKey: keys.list(query), queryFn: () => PayrollsService.list(query) });
}

export function usePayrollsByBranch(query?: PayrollQuery) {
  return useQuery<PayrollListResponse>({ queryKey: keys.branch(0, query), queryFn: () => PayrollsService.listByBranch(query) });
}

export function usePayroll(id: number) {
  return useQuery<PayrollRead>({ queryKey: keys.detail(id), queryFn: () => PayrollsService.getById(id), enabled: Number.isFinite(id) });
}

export function useCreatePayroll() {
  const qc = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (payload: PayrollCreate) => PayrollsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payrolls"] });
      toast({
        title: "Success",
        description: "Payroll record created successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Error creating payroll:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to create payroll record",
        variant: "destructive",
      });
    },
  });
}

export function useUpdatePayroll() {
  const qc = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PayrollUpdate }) => PayrollsService.update(id, payload),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: keys.detail(v.id) });
      qc.invalidateQueries({ queryKey: ["payrolls"] });
      toast({
        title: "Success",
        description: "Payroll record updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Error updating payroll:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to update payroll record",
        variant: "destructive",
      });
    },
  });
}

export function useUpdatePayrollStatus() {
  const qc = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => PayrollsService.updateStatus(id, status),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: keys.detail(v.id) });
      qc.invalidateQueries({ queryKey: ["payrolls"] });
      toast({
        title: "Success",
        description: "Payroll status updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Error updating payroll status:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to update payroll status",
        variant: "destructive",
      });
    },
  });
}


