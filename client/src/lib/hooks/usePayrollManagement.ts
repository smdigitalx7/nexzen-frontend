import { useState, useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import { usePayrolls, usePayrollsByBranch, useCreatePayroll, useUpdatePayroll, useUpdatePayrollStatus } from "@/lib/hooks/usePayrolls";
import { useEmployeesByBranch, useEmployeesByInstitute } from "@/lib/hooks/useEmployees";
import type { PayrollRead, PayrollCreate, PayrollUpdate } from "@/lib/types/payrolls";
import { PayrollStatusEnum, PaymentMethodEnum } from "@/lib/types/payrolls";

export const usePayrollManagement = () => {
  const { user, currentBranch } = useAuthStore();
  
  // UI State
  const [viewMode, setViewMode] = useState<"branch" | "institute">("branch");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>();
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showPayslipDialog, setShowPayslipDialog] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRead | null>(null);
  const [activeTab, setActiveTab] = useState("payrolls");

  // API Hooks
  const { data: branchPayrollsResp, isLoading: branchPayrollsLoading } = usePayrollsByBranch(currentBranch?.branch_id || 0);
  const { data: institutePayrollsResp, isLoading: institutePayrollsLoading } = usePayrolls();
  const { data: branchEmployees = [], isLoading: branchEmployeesLoading } = useEmployeesByBranch();
  const { data: instituteEmployees = [], isLoading: instituteEmployeesLoading } = useEmployeesByInstitute();
  
  const createPayrollMutation = useCreatePayroll();
  const updatePayrollMutation = useUpdatePayroll();
  const updatePayrollStatusMutation = useUpdatePayrollStatus();

  // Computed values
  const currentPayrolls = useMemo(() => {
    const branchList = branchPayrollsResp?.data || [];
    const instituteList = institutePayrollsResp?.data || [];
    return viewMode === "branch" ? branchList : instituteList;
  }, [viewMode, branchPayrollsResp, institutePayrollsResp]);

  const currentEmployees = useMemo(() => {
    return viewMode === "branch" ? branchEmployees : instituteEmployees;
  }, [viewMode, branchEmployees, instituteEmployees]);

  const isLoading = useMemo(() => {
    return viewMode === "branch" ? branchPayrollsLoading : institutePayrollsLoading;
  }, [viewMode, branchPayrollsLoading, institutePayrollsLoading]);

  const filteredPayrolls = useMemo(() => {
    return currentPayrolls.filter((payroll) => {
      const matchesSearch = payroll.employee_id
        .toString()
        .includes(searchQuery);

      const date = new Date(payroll.payroll_month);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const matchesMonth = !selectedMonth || month === selectedMonth;
      const matchesYear = !selectedYear || year === selectedYear;
      const matchesStatus = !selectedStatus || payroll.status === (selectedStatus as any);

      return matchesSearch && matchesMonth && matchesYear && matchesStatus;
    });
  }, [currentPayrolls, searchQuery, selectedMonth, selectedYear, selectedStatus]);

  // Statistics
  const totalPayrolls = currentPayrolls.length;
  const totalAmount = useMemo(() => {
    return currentPayrolls.reduce((sum, payroll) => sum + (payroll.gross_pay || 0), 0);
  }, [currentPayrolls]);

  const paidAmount = useMemo(() => {
    return currentPayrolls
      .filter(payroll => payroll.status === PayrollStatusEnum.PAID)
      .reduce((sum, payroll) => sum + (payroll.paid_amount || 0), 0);
  }, [currentPayrolls]);

  const pendingAmount = useMemo(() => {
    return currentPayrolls
      .filter(payroll => payroll.status === PayrollStatusEnum.PENDING)
      .reduce((sum, payroll) => sum + (payroll.gross_pay || 0), 0);
  }, [currentPayrolls]);

  // Handlers
  const handleCreatePayroll = async (data: PayrollCreate) => {
    try {
      await createPayrollMutation.mutateAsync(data);
      setShowCreateDialog(false);
    } catch (error) {
      console.error("Failed to create payroll:", error);
    }
  };

  const handleUpdatePayroll = async (id: number, data: PayrollUpdate) => {
    try {
      await updatePayrollMutation.mutateAsync({ id, payload: data });
      setShowUpdateDialog(false);
    } catch (error) {
      console.error("Failed to update payroll:", error);
    }
  };

  const handleUpdateStatus = async (id: number, status: PayrollStatusEnum) => {
    try {
      await updatePayrollStatusMutation.mutateAsync({ id, status });
    } catch (error) {
      console.error("Failed to update payroll status:", error);
    }
  };

  const handleViewPayslip = (payroll: PayrollRead) => {
    setSelectedPayroll(payroll);
    setShowPayslipDialog(true);
  };

  const handleEditPayroll = (payroll: PayrollRead) => {
    setSelectedPayroll(payroll);
    setShowUpdateDialog(true);
  };

  // Utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case PayrollStatusEnum.PAID:
        return "bg-green-500";
      case PayrollStatusEnum.PENDING:
        return "bg-yellow-500";
      case PayrollStatusEnum.HOLD:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case PayrollStatusEnum.PAID:
        return "Paid";
      case PayrollStatusEnum.PENDING:
        return "Pending";
      case PayrollStatusEnum.HOLD:
        return "On Hold";
      default:
        return "Unknown";
    }
  };

  return {
    // Data
    payrolls: filteredPayrolls,
    employees: currentEmployees,
    
    // Statistics
    totalPayrolls,
    totalAmount,
    paidAmount,
    pendingAmount,
    
    // UI State
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    selectedStatus,
    setSelectedStatus,
    showCreateDialog,
    setShowCreateDialog,
    showUpdateDialog,
    setShowUpdateDialog,
    showPayslipDialog,
    setShowPayslipDialog,
    selectedPayroll,
    setSelectedPayroll,
    activeTab,
    setActiveTab,
    
    // Loading states
    isLoading,
    
    // Handlers
    handleCreatePayroll,
    handleUpdatePayroll,
    handleUpdateStatus,
    handleViewPayslip,
    handleEditPayroll,
    
    // Utilities
    formatCurrency,
    getStatusColor,
    getStatusText,
    
    // User context
    user,
    currentBranch,
  };
};
