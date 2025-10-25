import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useTabNavigation } from "../use-tab-navigation";
import { PayrollsService } from "@/lib/services/general/payrolls.service";
import { useEmployeesByBranch } from "@/lib/hooks/general/useEmployees";
import type {
  PayrollRead,
  PayrollCreate,
  PayrollUpdate,
  PayrollQuery,
  PayrollDashboardStats,
  RecentPayroll,
} from "@/lib/types/general/payrolls";
import {
  PayrollStatusEnum,
  PaymentMethodEnum,
} from "@/lib/types/general/payrolls";
import { formatCurrency } from "@/lib/utils";

// Extended interface that includes employee information
interface PayrollWithEmployee extends Omit<PayrollRead, "payroll_month"> {
  employee_name: string;
  employee_type?: string;
  payroll_month: number; // Changed from string to number to match API
  payroll_year: number;
}

// Query keys for payroll operations
const payrollKeys = {
  all: ["payrolls"] as const,
  lists: () => [...payrollKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...payrollKeys.lists(), { filters }] as const,
  details: () => [...payrollKeys.all, "detail"] as const,
  detail: (id: number) => [...payrollKeys.details(), id] as const,
  byBranch: () => [...payrollKeys.all, "by-branch"] as const,
  dashboard: () => [...payrollKeys.all, "dashboard"] as const,
  recent: (limit?: number) =>
    [...payrollKeys.all, "recent", { limit }] as const,
};

// Basic payroll hooks (moved from usePayrolls.ts)
export const usePayrolls = (query?: PayrollQuery) => {
  return useQuery({
    queryKey: payrollKeys.list(query || {}),
    queryFn: () =>
      PayrollsService.listAll(query?.month, query?.year, query?.status),
  });
};

export const usePayrollsByBranch = (query?: PayrollQuery) => {
  return useQuery({
    queryKey: [...payrollKeys.byBranch(), query || {}],
    queryFn: () =>
      PayrollsService.listByBranch(
        query?.limit || 10,
        1,
        query?.month,
        query?.year,
        query?.status
      ),
  });
};

export const usePayroll = (id: number) => {
  return useQuery({
    queryKey: payrollKeys.detail(id),
    queryFn: () => PayrollsService.getById(id),
    enabled: !!id,
  });
};

export const useCreatePayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PayrollCreate) => PayrollsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.lists() });
      queryClient.invalidateQueries({ queryKey: payrollKeys.byBranch() });
    },
  });
};

export const useUpdatePayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PayrollUpdate }) =>
      PayrollsService.update(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.lists() });
      queryClient.invalidateQueries({ queryKey: payrollKeys.byBranch() });
      queryClient.invalidateQueries({
        queryKey: payrollKeys.detail(variables.id),
      });
    },
  });
};

export const useUpdatePayrollStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, new_status }: { id: number; new_status: string }) =>
      PayrollsService.updateStatus(id, new_status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.lists() });
      queryClient.invalidateQueries({ queryKey: payrollKeys.byBranch() });
      queryClient.invalidateQueries({
        queryKey: payrollKeys.detail(variables.id),
      });
    },
  });
};

export const usePayrollDashboard = () => {
  return useQuery({
    queryKey: payrollKeys.dashboard(),
    queryFn: () => PayrollsService.getDashboard(),
  });
};

export const useRecentPayrolls = (limit: number = 5) => {
  return useQuery({
    queryKey: payrollKeys.recent(limit),
    queryFn: () => PayrollsService.getRecent(limit),
  });
};

export const usePayrollManagement = () => {
  const { user, currentBranch } = useAuthStore();
  const { activeTab, setActiveTab } = useTabNavigation("payrolls");
  const queryClient = useQueryClient();

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>();
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showPayslipDialog, setShowPayslipDialog] = useState(false);
  const [selectedPayroll, setSelectedPayroll] =
    useState<PayrollWithEmployee | null>(null);

  // API Hooks - Always fetch all data, do client-side filtering
  // This ensures we have data to work with regardless of API filtering capabilities
  const {
    data: payrollsResp,
    isLoading: payrollsLoading,
    error,
  } = usePayrolls({});

  const { data: employees = [], isLoading: employeesLoading } =
    useEmployeesByBranch();

  // Additional API hooks for enhanced features
  const { data: dashboardStats } = useQuery({
    queryKey: ["payrolls", "dashboard"],
    queryFn: () => PayrollsService.getDashboard(),
  });

  const { data: pendingCount } = useQuery({
    queryKey: ["payrolls", "pending-count"],
    queryFn: () => PayrollsService.getPendingCount(),
  });

  const createPayrollMutation = useCreatePayroll();
  const updatePayrollMutation = useUpdatePayroll();
  const updatePayrollStatusMutation = useUpdatePayrollStatus();

  // Bulk operations mutation
  const bulkCreateMutation = useMutation({
    mutationFn: (data: any[]) => PayrollsService.bulkCreate(data),
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: payrollKeys.lists() });
      queryClient.invalidateQueries({ queryKey: payrollKeys.byBranch() });
    },
  });

  // Computed values - Flatten nested payroll data structure and enrich with employee names
  const currentPayrolls = useMemo(() => {
    // Flatten the nested structure: data -> monthGroups -> payrolls
    const flattenedPayrolls =
      payrollsResp?.data?.flatMap(
        (monthGroup: any) => monthGroup.payrolls || []
      ) || [];

    // Enrich payroll data with employee names
    const enrichedPayrolls = flattenedPayrolls.map((payrollRecord: any) => {
      const employee = employees.find(
        (emp) => emp.employee_id === payrollRecord.employee_id
      );

      // Better fallback logic for employee names
      let employeeName = "Unknown Employee";
      if (employee?.employee_name) {
        employeeName = employee.employee_name;
      } else if (
        payrollRecord.employee_name &&
        payrollRecord.employee_name !== "Unknown Employee"
      ) {
        employeeName = payrollRecord.employee_name;
      } else {
        employeeName = `Employee #${payrollRecord.employee_id}`;
      }

      return {
        ...payrollRecord,
        employee_name: employeeName,
        employee_type:
          employee?.employee_type || payrollRecord.employee_type || "Unknown",
      };
    });

    return enrichedPayrolls;
  }, [payrollsResp, employees]);

  const currentEmployees = useMemo(() => {
    return employees;
  }, [employees]);

  const isLoading = useMemo(() => {
    return payrollsLoading || employeesLoading;
  }, [payrollsLoading, employeesLoading]);

  const filteredPayrolls = useMemo(() => {
    return currentPayrolls.filter((payroll: any) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        (payroll.employee_name &&
          payroll.employee_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (payroll.employee_id &&
          payroll.employee_id.toString().includes(searchQuery));

      // Month/Year filter - handle both numeric and date formats
      let matchesMonth = true;
      let matchesYear = true;

      if (selectedMonth || selectedYear) {
        // Try to get month/year from payroll data
        let month, year;

        // First try direct numeric values
        if (payroll.payroll_month && payroll.payroll_year) {
          month = payroll.payroll_month;
          year = payroll.payroll_year;
        }
        // Try string date format
        else if (
          payroll.payroll_month &&
          typeof payroll.payroll_month === "string"
        ) {
          const date = new Date(payroll.payroll_month);
          month = date.getMonth() + 1;
          year = date.getFullYear();
        }
        // Try to extract from generated_at or other date fields
        else if (payroll.generated_at) {
          const date = new Date(payroll.generated_at);
          month = date.getMonth() + 1;
          year = date.getFullYear();
        }
        // Fallback to current date
        else {
          month = new Date().getMonth() + 1;
          year = new Date().getFullYear();
        }

        // Fix invalid years (1970) by using generated_at date
        if (!year || year === 1970 || year < 2000) {
          if (payroll.generated_at) {
            const generatedDate = new Date(payroll.generated_at);
            year = generatedDate.getFullYear();
          } else {
            year = new Date().getFullYear();
          }
        }

        // Also fix month if it's invalid - some records might have wrong month data
        if (!month || month < 1 || month > 12) {
          month = new Date().getMonth() + 1;
        }

        matchesMonth = !selectedMonth || month === selectedMonth;
        matchesYear = !selectedYear || year === selectedYear;
      }

      // Status filter
      const matchesStatus =
        !selectedStatus || payroll.status === selectedStatus;

      return matchesSearch && matchesMonth && matchesYear && matchesStatus;
    });
  }, [
    currentPayrolls,
    searchQuery,
    selectedMonth,
    selectedYear,
    selectedStatus,
  ]);

  // Transform payrolls to include employee information
  const payrollsWithEmployee = useMemo(() => {
    return filteredPayrolls.map((payroll: any) => {
      const employee = currentEmployees.find(
        (emp) => emp.employee_id === payroll.employee_id
      );
      const date = payroll.payroll_month
        ? new Date(payroll.payroll_month)
        : new Date();
      const year = date.getFullYear();

      return {
        ...payroll,
        employee_name: employee?.employee_name || "Unknown Employee",
        payroll_year: year,
      };
    });
  }, [filteredPayrolls, currentEmployees]);

  // Statistics
  const totalPayrolls = currentPayrolls.length;
  const totalAmount = useMemo(() => {
    return currentPayrolls.reduce(
      (sum: number, payroll: any) => sum + (payroll.gross_pay || 0),
      0
    );
  }, [currentPayrolls]);

  const paidAmount = useMemo(() => {
    return currentPayrolls
      .filter((payroll: any) => payroll.status === PayrollStatusEnum.PAID)
      .reduce(
        (sum: number, payroll: any) => sum + (payroll.paid_amount || 0),
        0
      );
  }, [currentPayrolls]);

  const pendingAmount = useMemo(() => {
    return currentPayrolls
      .filter((payroll: any) => payroll.status === PayrollStatusEnum.PENDING)
      .reduce((sum: number, payroll: any) => sum + (payroll.gross_pay || 0), 0);
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

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await updatePayrollStatusMutation.mutateAsync({ id, new_status: status });
    } catch (error) {
      console.error("Failed to update payroll status:", error);
    }
  };

  const handleViewPayslip = (payroll: PayrollWithEmployee) => {
    setSelectedPayroll(payroll);
    setShowPayslipDialog(true);
  };

  const handleEditPayroll = (payroll: PayrollWithEmployee) => {
    setSelectedPayroll(payroll);
    setShowUpdateDialog(true);
  };

  // Wrapper function for SalaryCalculationForm
  const handleFormSubmit = async (data: PayrollCreate | PayrollUpdate) => {
    if (selectedPayroll) {
      // Update existing payroll
      await handleUpdatePayroll(
        selectedPayroll.payroll_id,
        data as PayrollUpdate
      );
    } else {
      // Create new payroll
      await handleCreatePayroll(data as PayrollCreate);
    }
  };

  // Bulk operations handlers
  const handleBulkCreate = async (data: any[]) => {
    try {
      await bulkCreateMutation.mutateAsync(data);
    } catch (error) {
      console.error("Failed to create bulk payrolls:", error);
    }
  };

  const handleBulkExport = async () => {
    try {
      // Implement export functionality
      const data = currentPayrolls;
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payrolls-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export payrolls:", error);
    }
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
    payrolls: payrollsWithEmployee,
    employees: currentEmployees,

    // Statistics
    totalPayrolls,
    totalAmount,
    paidAmount,
    pendingAmount,
    pendingCount: pendingCount || 0,
    dashboardStats,

    // UI State
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
    handleFormSubmit,

    // Bulk operations
    handleBulkCreate,
    handleBulkExport,

    // Utilities
    formatCurrency,
    getStatusColor,
    getStatusText,

    // User context
    user,
    currentBranch,
  };
};
