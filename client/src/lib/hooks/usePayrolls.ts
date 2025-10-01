import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ServiceLocator } from "@/core";
import type { PayrollRead, PayrollCreate, PayrollUpdate, PayrollQuery, PayrollListResponse } from "@/lib/types/payrolls";
import { useToast } from "@/hooks/use-toast";

const keys = {
  list: (query?: PayrollQuery) => ["payrolls", query || {}] as const,
  branch: (branch_id: number, query?: PayrollQuery) => ["payrolls", "branch", branch_id, query || {}] as const,
  detail: (id: number) => ["payrolls", id] as const,
};

export function usePayrolls(query?: PayrollQuery) {
  return useQuery<PayrollListResponse>({ 
    queryKey: keys.list(query), 
    queryFn: async () => {
      const payrollUseCases = ServiceLocator.getPayrollUseCases();
      const payrolls = await payrollUseCases.getAllPayrolls();
      
      // Convert clean architecture response to backend format
      const payrollList = payrolls.map(payrollEntity => ({
        payroll_id: payrollEntity.id,
        employee_id: payrollEntity.employeeId,
        payroll_month: `${payrollEntity.year}-${payrollEntity.month.toString().padStart(2, '0')}-01`, // Backend expects date string
        previous_balance: 0, // Default value
        gross_pay: payrollEntity.basicSalary + payrollEntity.allowances,
        lop: 0, // Default value
        advance_deduction: 0, // Default value
        other_deductions: payrollEntity.deductions,
        total_deductions: payrollEntity.deductions,
        net_pay: payrollEntity.netSalary,
        paid_amount: payrollEntity.status === 'PAID' ? payrollEntity.netSalary : 0,
        carryover_balance: 0, // Default value
        payment_method: payrollEntity.paymentMethod as any,
        payment_notes: payrollEntity.notes || undefined,
        status: payrollEntity.status as any,
        generated_at: payrollEntity.createdAt, // Already in correct format
        updated_at: payrollEntity.updatedAt, // Already in correct format
        generated_by: null, // Not available in entity
        updated_by: null, // Not available in entity
      }));
      
      return {
        data: payrollList,
        total: payrollList.length,
        pages: Math.ceil(payrollList.length / (query?.limit || 10)),
        current_page: 1,
        pageSize: query?.limit || 10,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function usePayrollsByBranch(branchId: number, query?: PayrollQuery) {
  return useQuery<PayrollListResponse>({ 
    queryKey: keys.branch(branchId, query), 
    queryFn: async () => {
      const payrollUseCases = ServiceLocator.getPayrollUseCases();
      const payrolls = await payrollUseCases.getPayrollsByBranch(branchId);
      
      // Convert clean architecture response to backend format
      const payrollList = payrolls.map(payrollEntity => ({
        payroll_id: payrollEntity.id,
        employee_id: payrollEntity.employeeId,
        payroll_month: `${payrollEntity.year}-${payrollEntity.month.toString().padStart(2, '0')}-01`, // Backend expects date string
        previous_balance: 0, // Default value
        gross_pay: payrollEntity.basicSalary + payrollEntity.allowances,
        lop: 0, // Default value
        advance_deduction: 0, // Default value
        other_deductions: payrollEntity.deductions,
        total_deductions: payrollEntity.deductions,
        net_pay: payrollEntity.netSalary,
        paid_amount: payrollEntity.status === 'PAID' ? payrollEntity.netSalary : 0,
        carryover_balance: 0, // Default value
        payment_method: payrollEntity.paymentMethod as any,
        payment_notes: payrollEntity.notes || undefined,
        status: payrollEntity.status as any,
        generated_at: payrollEntity.createdAt, // Already in correct format
        updated_at: payrollEntity.updatedAt, // Already in correct format
        generated_by: null, // Not available in entity
        updated_by: null, // Not available in entity
      }));
      
      return {
        data: payrollList,
        total: payrollList.length,
        pages: Math.ceil(payrollList.length / (query?.limit || 10)),
        current_page: 1,
        pageSize: query?.limit || 10,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function usePayroll(id: number) {
  return useQuery<PayrollRead>({ 
    queryKey: keys.detail(id), 
    queryFn: async () => {
      const payrollUseCases = ServiceLocator.getPayrollUseCases();
      const payroll = await payrollUseCases.getPayrollById(id);
      
      if (!payroll) {
        throw new Error('Payroll not found');
      }
      
      // Convert clean architecture response to backend format
      return {
        payroll_id: payroll.id,
        employee_id: payroll.employeeId,
        payroll_month: `${payroll.year}-${payroll.month.toString().padStart(2, '0')}-01`, // Backend expects date string
        previous_balance: 0, // Default value
        gross_pay: payroll.basicSalary + payroll.allowances,
        lop: 0, // Default value
        advance_deduction: 0, // Default value
        other_deductions: payroll.deductions,
        total_deductions: payroll.deductions,
        net_pay: payroll.netSalary,
        paid_amount: payroll.status === 'PAID' ? payroll.netSalary : 0,
        carryover_balance: 0, // Default value
        payment_method: payroll.paymentMethod as any,
        payment_notes: payroll.notes || undefined,
        status: payroll.status as any,
        generated_at: payroll.createdAt, // Already in correct format
        updated_at: payroll.updatedAt, // Already in correct format
        generated_by: null, // Not available in entity
        updated_by: null, // Not available in entity
      };
    }, 
    enabled: Number.isFinite(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreatePayroll() {
  const qc = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (payload: PayrollCreate) => {
      console.log("Creating payroll with clean architecture...");
      const payrollUseCases = ServiceLocator.getPayrollUseCases();
      const payroll = await payrollUseCases.createPayroll({
        employeeId: payload.employee_id,
        branchId: 1, // Default branch
        month: new Date(payload.payroll_month).getMonth() + 1,
        year: new Date(payload.payroll_month).getFullYear(),
        basicSalary: payload.gross_pay,
        allowances: 0,
        deductions: (payload.advance_deduction || 0) + (payload.other_deductions || 0),
        status: 'PENDING',
        paymentMethod: 'CASH',
        paymentDate: undefined,
        notes: undefined,
      });
      
      // Return the response data directly
      return payroll;
    },
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
    mutationFn: async ({ id, payload }: { id: number; payload: PayrollUpdate }) => {
      console.log(`Updating payroll ${id} with clean architecture...`);
      const payrollUseCases = ServiceLocator.getPayrollUseCases();
      const payroll = await payrollUseCases.updatePayroll({
        id,
        basicSalary: payload.gross_pay,
        allowances: 0,
        deductions: (payload.advance_deduction || 0) + (payload.other_deductions || 0),
        status: payload.status,
        paymentMethod: payload.payment_method,
        paymentDate: undefined,
        notes: payload.payment_notes,
      });
      
      // Convert clean architecture response to legacy format
      return {
        payroll_id: payroll.id,
        employee_id: payroll.employeeId,
        branch_id: payroll.branchId,
        month: payroll.month,
        year: payroll.year,
        basic_salary: payroll.basicSalary,
        allowances: payroll.allowances,
        deductions: payroll.deductions,
        net_salary: payroll.netSalary,
        status: payroll.status,
        payment_method: payroll.paymentMethod,
        payment_date: payroll.paymentDate,
        notes: payroll.notes,
        created_at: payroll.createdAt,
        updated_at: payroll.updatedAt,
        created_by: null,
        updated_by: null,
      };
    },
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
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      console.log(`Updating payroll status ${id} with clean architecture...`);
      const payrollUseCases = ServiceLocator.getPayrollUseCases();
      const payroll = await payrollUseCases.updatePayroll({ 
        id, 
        status,
        basicSalary: undefined,
        allowances: undefined,
        deductions: undefined,
        paymentMethod: undefined,
        paymentDate: undefined,
        notes: undefined
      });
      
      // Convert clean architecture response to legacy format
      return {
        payroll_id: payroll.id,
        employee_id: payroll.employeeId,
        branch_id: payroll.branchId,
        month: payroll.month,
        year: payroll.year,
        basic_salary: payroll.basicSalary,
        allowances: payroll.allowances,
        deductions: payroll.deductions,
        net_salary: payroll.netSalary,
        status: payroll.status,
        payment_method: payroll.paymentMethod,
        payment_date: payroll.paymentDate,
        notes: payroll.notes,
        created_at: payroll.createdAt,
        updated_at: payroll.updatedAt,
        created_by: null,
        updated_by: null,
      };
    },
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


