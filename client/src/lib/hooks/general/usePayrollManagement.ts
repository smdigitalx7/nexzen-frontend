import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useTabNavigation } from "../use-tab-navigation";
import { PayrollsService } from "@/lib/services/general/payrolls.service";
import { useEmployeesByBranch, employeeKeys } from "@/lib/hooks/general/useEmployees";
import type {
  PayrollRead,
  PayrollCreate,
  PayrollUpdate,
  PayrollQuery,
  PayrollDashboardStats,
  RecentPayroll,
} from "@/lib/types/general/payrolls";
import { PayrollStatusEnum } from "@/lib/types/general/payrolls";
import { formatCurrency } from "@/lib/utils";
import { useMutationWithSuccessToast } from "@/lib/hooks/common/use-mutation-with-toast";

// Extended interface that includes employee information
interface PayrollWithEmployee extends Omit<PayrollRead, "payroll_month"> {
  employee_name: string;
  employee_type?: string;
  payroll_month: number; // Changed from string to number to match API
  payroll_year: number;
}

// Query keys for payroll operations
export const payrollKeys = {
  all: ["payrolls"] as const,
  lists: () => [...payrollKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
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
    queryKey: payrollKeys.list(query as Record<string, unknown>),
    queryFn: () =>
      PayrollsService.listAll(query?.month, query?.year, query?.status),
  });
};

export const usePayrollsByBranch = (query?: PayrollQuery) => {
  // Default to current month/year if not provided (mandatory parameters)
  const now = new Date();
  const month = query?.month ?? now.getMonth() + 1;
  const year = query?.year ?? now.getFullYear();
  
  return useQuery({
    queryKey: [...payrollKeys.byBranch(), { month, year, status: query?.status }],
    queryFn: () =>
      PayrollsService.listByBranch(
        month,
        year,
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

  // Initialize month/year to current values (required parameters)
  const now = new Date();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showPayslipDialog, setShowPayslipDialog] = useState(false);
  const [selectedPayroll, setSelectedPayroll] =
    useState<PayrollWithEmployee | null>(null);
  const [selectedPayrollId, setSelectedPayrollId] = useState<number | null>(null);

  // API Hooks - Fetch payrolls filtered by current branch with month/year
  const {
    data: payrollsResp,
    isLoading: payrollsLoading,
    error,
  } = usePayrollsByBranch({ month: selectedMonth, year: selectedYear, status: selectedStatus });

  // Employees are needed for payroll management, but with caching to prevent excessive refetches
  const { data: employees = [], isLoading: employeesLoading } =
    useEmployeesByBranch(true);

  // Additional API hooks for enhanced features
  const { data: dashboardStats } = useQuery({
    queryKey: ["payrolls", "dashboard"],
    queryFn: () => PayrollsService.getDashboard(),
  });

  // Detailed payroll query for view functionality
  const { data: detailedPayroll, isLoading: detailedPayrollLoading } = useQuery({
    queryKey: payrollKeys.detail(selectedPayrollId || 0),
    queryFn: () => PayrollsService.getById(selectedPayrollId!),
    enabled: !!selectedPayrollId,
  });


  // Interface for API response structure (month groups)
  interface PayrollMonthGroup {
    payrolls?: PayrollRead[];
    [key: string]: unknown;
  }

  // Computed values - Flatten nested payroll data structure and enrich with employee names
  const currentPayrolls = useMemo(() => {
    // Flatten the nested structure: data -> monthGroups -> payrolls
    // Both listAll and listByBranch return the same structure: PayrollListResponse with data as PayrollMonthGroup[]
    const flattenedPayrolls =
      Array.isArray(payrollsResp?.data)
        ? (payrollsResp.data as unknown as PayrollMonthGroup[]).flatMap(
            (monthGroup: PayrollMonthGroup) => monthGroup.payrolls || []
          )
        : [];

    // Enrich payroll data with employee names
    const enrichedPayrolls = flattenedPayrolls.map((payrollRecord: PayrollRead) => {
      const employee = employees.find(
        (emp) => emp.employee_id === payrollRecord.employee_id
      );

      // Better fallback logic for employee names - prioritize API response data
      const payrollWithExtras = payrollRecord as PayrollRead & { employee_name?: string; employee_type?: string };
      let employeeName = "Unknown Employee";
      if (
        payrollWithExtras.employee_name &&
        payrollWithExtras.employee_name !== "Unknown Employee"
      ) {
        employeeName = payrollWithExtras.employee_name;
      } else if (employee?.employee_name) {
        employeeName = employee.employee_name;
      } else {
        employeeName = `Employee #${payrollRecord.employee_id}`;
      }

      return {
        ...payrollRecord,
        employee_name: employeeName,
        employee_type:
          employee?.employee_type || payrollWithExtras.employee_type || "Unknown",
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

  const queryClient = useQueryClient();

  // Create payroll mutation with centralized toast handling
  const createPayrollMutation = useMutationWithSuccessToast(
    {
      mutationFn: (data: PayrollCreate) => PayrollsService.create(data),
      onSuccess: () => {
        // Optimized cache invalidation - only invalidate what's needed
        // Use setTimeout to debounce and prevent UI freezing
        setTimeout(() => {
          // Only invalidate payroll queries, not employee queries
          queryClient.invalidateQueries({ queryKey: payrollKeys.all });
          // Refetch only active queries without blocking
          queryClient.refetchQueries({ 
            queryKey: payrollKeys.byBranch(), 
            type: 'active' 
          }).catch(() => {
            // Silently handle errors
          });
        }, 100);
        
        setShowCreateDialog(false);
      },
    },
    "Payroll created successfully"
  );

  // Update payroll mutation with centralized toast handling
  const updatePayrollMutation = useMutationWithSuccessToast(
    {
      mutationFn: ({ id, data }: { id: number; data: PayrollUpdate }) => 
        PayrollsService.update(id, data),
      onSuccess: () => {
        // Optimized cache invalidation - only invalidate what's needed
        // Use setTimeout to debounce and prevent UI freezing
        setTimeout(() => {
          // Only invalidate payroll queries, not employee queries
          queryClient.invalidateQueries({ queryKey: payrollKeys.all });
          // Refetch only active queries without blocking
          queryClient.refetchQueries({ 
            queryKey: payrollKeys.byBranch(), 
            type: 'active' 
          }).catch(() => {
            // Silently handle errors
          });
        }, 100);
        
        setShowUpdateDialog(false);
        setSelectedPayroll(null);
      },
    },
    "Payroll updated successfully"
  );

  // Handlers
  const handleCreatePayroll = async (data: PayrollCreate) => {
    await createPayrollMutation.mutateAsync(data);
  };

  const handleUpdatePayroll = async (id: number, data: PayrollUpdate) => {
    await updatePayrollMutation.mutateAsync({ id, data });
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    console.warn("Update payroll status endpoint is not implemented in the backend");
  };

  const handleViewPayslip = (payroll: PayrollWithEmployee) => {
    setSelectedPayroll(payroll);
    setSelectedPayrollId(payroll.payroll_id);
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
    selectedPayrollId,
    setSelectedPayrollId,
    detailedPayroll,
    detailedPayrollLoading,
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

    // Utilities
    formatCurrency,
    getStatusColor,
    getStatusText,

    // User context
    user,
    currentBranch,
  };
};
