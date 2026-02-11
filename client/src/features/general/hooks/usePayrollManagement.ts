import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/core/auth/authStore";
import { useTabNavigation } from "@/common/hooks/use-tab-navigation";
import { PayrollsService } from "@/features/general/services/payrolls.service";
import {
  useEmployeesByBranch,
  employeeKeys,
} from "@/features/general/hooks/useEmployees";
import type {
  PayrollRead,
  PayrollCreate,
  PayrollUpdate,
  PayrollQuery,
  PayrollDashboardStats,
  RecentPayroll,
  PayrollStatusUpdate,
} from "@/features/general/types/payrolls";
import { PayrollStatusEnum } from "@/features/general/types/payrolls";
import { formatCurrency } from "@/common/utils";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";

// Extended interface that includes employee information
interface PayrollWithEmployee extends Omit<PayrollRead, "payroll_month"> {
  employee_name: string;
  employee_type?: string;
  payroll_month: number | string; // API can return number or date string
  payroll_year?: number;
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
    queryKey: [
      ...payrollKeys.byBranch(),
      { month, year, status: query?.status },
    ],
    queryFn: () => PayrollsService.listByBranch(month, year, query?.status),
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
  const [selectedMonth, setSelectedMonth] = useState<number>(
    now.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [payrollPage, setPayrollPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showPayslipDialog, setShowPayslipDialog] = useState(false);
  const [selectedPayroll, setSelectedPayroll] =
    useState<PayrollWithEmployee | null>(null);
  const [selectedPayrollId, setSelectedPayrollId] = useState<number | null>(
    null
  );

  // API Hooks - Fetch payrolls filtered by current branch with month/year
  const {
    data: payrollsResp,
    isLoading: payrollsLoading,
    error,
  } = usePayrollsByBranch({
    month: selectedMonth,
    year: selectedYear,
    status: selectedStatus,
    page: payrollPage,
    page_size: pageSize,
  });

  // Employees are needed for payroll management, but with caching to prevent excessive refetches
  const { data: employeesData = [], isLoading: employeesLoading } =
    useEmployeesByBranch(true);

  // ✅ FIX: Ensure employees is always an array to prevent "find is not a function" errors
  const employees: any[] = Array.isArray(employeesData) ? employeesData : [];

  // Additional API hooks for enhanced features
  const { data: dashboardStats } = useQuery({
    queryKey: ["payrolls", "dashboard"],
    queryFn: () => PayrollsService.getDashboard(),
  });

  // Detailed payroll query for view functionality
  const { data: detailedPayroll, isLoading: detailedPayrollLoading } =
    useQuery<PayrollRead>({
      queryKey: payrollKeys.detail(selectedPayrollId || 0),
      queryFn: () => PayrollsService.getById(selectedPayrollId!),
      enabled: !!selectedPayrollId,
    });

  // Interface for API response structure (month groups)
  interface PayrollMonthGroup {
    payrolls?: PayrollRead[];
    [key: string]: unknown;
  }

  const totalCount = payrollsResp?.total_count || 0;
  const totalPages = payrollsResp?.total_pages || 0;

  const currentPayrolls = useMemo(() => {
    const rawData: any = payrollsResp?.data;
    if (!rawData) return [];

    const rawEmployees: any[] = employees;

    // If data is directly an array, use it
    if (Array.isArray(rawData) && rawData.length > 0 && typeof (rawData[0]) === 'object' && rawData[0] !== null && 'payroll_id' in rawData[0]) {
      return (rawData as any[]).map((payrollRecord: any) => {
        const employee = rawEmployees.find((emp: any) => emp && emp.employee_id === payrollRecord.employee_id);
        const apiEmployeeName = payrollRecord.employee_name;
        const employeeName = (apiEmployeeName && apiEmployeeName.trim() !== "" && apiEmployeeName !== "Unknown Employee")
          ? apiEmployeeName
          : (employee?.employee_name || `Employee #${payrollRecord.employee_id}`);
        
        return {
          ...payrollRecord,
          employee_name: employeeName,
          employee_type: payrollRecord.employee_type || employee?.employee_type || "Unknown",
        };
      });
    }

    // Otherwise handle nested structure
    const flattenedPayrolls = Array.isArray(rawData)
      ? (rawData as unknown as any[]).flatMap(
          (monthGroup: any) => monthGroup.payrolls || []
        )
      : [];

    return (flattenedPayrolls as any[]).map((payrollRecord: any) => {
      const employee = rawEmployees.find((emp: any) => emp && emp.employee_id === payrollRecord.employee_id);
      const apiEmployeeName = payrollRecord.employee_name;
      const employeeName = (apiEmployeeName && apiEmployeeName.trim() !== "" && apiEmployeeName !== "Unknown Employee")
        ? apiEmployeeName
        : (employee?.employee_name || `Employee #${payrollRecord.employee_id}`);
      
      return {
        ...payrollRecord,
        employee_name: employeeName,
        employee_type: payrollRecord.employee_type || employee?.employee_type || "Unknown",
      };
    });
  }, [payrollsResp, employees]);

  const currentEmployees = useMemo(() => {
    return employees;
  }, [employees]);

  const isLoading = useMemo(() => {
    return payrollsLoading || employeesLoading;
  }, [payrollsLoading, employeesLoading]);

  const filteredPayrolls = useMemo(() => {
    return currentPayrolls.filter((payroll: PayrollWithEmployee) => {
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

        // Normalize month to a number before validation
        if (typeof month === "string") {
          const asNumber = Number(month);
          if (Number.isFinite(asNumber)) {
            month = asNumber;
          }
        }

        // Also fix month if it's invalid - some records might have wrong month data
        const monthNumber = typeof month === "string" ? Number(month) : month;
        if (!monthNumber || monthNumber < 1 || monthNumber > 12) {
          month = new Date().getMonth() + 1;
        } else {
          month = monthNumber;
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

  const payrollsWithEmployee = useMemo(() => {
    const rawEmployees: any[] = currentEmployees;
    return filteredPayrolls.map((payroll: any) => {
      const employee = rawEmployees.find(
        (emp: any) => emp.employee_id === payroll.employee_id
      );
      const date = payroll.payroll_month
        ? new Date(payroll.payroll_month)
        : new Date();
      const year = date.getFullYear();

      // ✅ FIX: Use employee_name from API if it exists, otherwise fall back to employees array
      const employeeName =
        payroll.employee_name &&
        payroll.employee_name.trim() !== "" &&
        payroll.employee_name !== "Unknown Employee"
          ? payroll.employee_name
          : employee?.employee_name || "Unknown Employee";

      return {
        ...payroll,
        employee_name: employeeName, // Preserve API value or use fallback
        payroll_year: year,
      };
    });
  }, [filteredPayrolls, currentEmployees]);

  // Statistics
  const totalPayrolls = currentPayrolls.length;
  const totalAmount = useMemo(() => {
    return currentPayrolls.reduce(
      (sum: number, payroll: PayrollWithEmployee) =>
        sum + (payroll.gross_pay || 0),
      0
    );
  }, [currentPayrolls]);

  const paidAmount = useMemo(() => {
    return currentPayrolls
      .filter(
        (payroll: PayrollWithEmployee) =>
          payroll.status === PayrollStatusEnum.PAID
      )
      .reduce(
        (sum: number, payroll: PayrollWithEmployee) =>
          sum + (payroll.paid_amount || 0),
        0
      );
  }, [currentPayrolls]);

  const pendingAmount = useMemo(() => {
    return currentPayrolls
      .filter(
        (payroll: PayrollWithEmployee) =>
          payroll.status === PayrollStatusEnum.PENDING
      )
      .reduce(
        (sum: number, payroll: PayrollWithEmployee) =>
          sum + (payroll.gross_pay || 0),
        0
      );
  }, [currentPayrolls]);

  const queryClient = useQueryClient();

  // Create payroll mutation with centralized toast handling
  const createPayrollMutation = useMutationWithSuccessToast(
    {
      mutationFn: (data: PayrollCreate) => {
        // ✅ FIX: Log the API call for debugging (remove in production if needed)
        if (import.meta.env.DEV) {
          console.log("Creating payroll with data:", data);
        }
        return PayrollsService.create(data);
      },
      onSuccess: () => {
        // Optimized cache invalidation - only invalidate what's needed
        // Use setTimeout to debounce and prevent UI freezing
        setTimeout(() => {
          // Only invalidate payroll queries, not employee queries
          queryClient.invalidateQueries({ queryKey: payrollKeys.all });
          // Refetch only active queries without blocking
          queryClient
            .refetchQueries({
              queryKey: payrollKeys.byBranch(),
              type: "active",
            })
            .catch(() => {
              // Silently handle errors
            });
        }, 100);

        // ✅ FIX: Close create dialog after successful creation
        setShowCreateDialog(false);
        setSelectedPayroll(null);
      },
      onError: (error) => {
        // ✅ FIX: Log error for debugging
        if (import.meta.env.DEV) {
          console.error("Payroll creation failed:", error);
        }
        // Error toast is handled by useMutationWithSuccessToast
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
          queryClient
            .refetchQueries({
              queryKey: payrollKeys.byBranch(),
              type: "active",
            })
            .catch(() => {
              // Silently handle errors
            });
        }, 100);

        setShowUpdateDialog(false);
        setSelectedPayroll(null);
      },
    },
    "Payroll updated successfully"
  );

  // Update payroll status mutation with centralized toast handling
  const updateStatusMutation = useMutationWithSuccessToast(
    {
      mutationFn: ({
        id,
        data,
      }: {
        id: number;
        data: PayrollStatusUpdate;
      }) => PayrollsService.updateStatus(id, data),
      onSuccess: () => {
        // Optimized cache invalidation - only invalidate what's needed
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: payrollKeys.all });
          queryClient
            .refetchQueries({
              queryKey: payrollKeys.byBranch(),
              type: "active",
            })
            .catch(() => {
              // Silently handle errors
            });
        }, 100);
      },
    },
    "Payroll status updated successfully"
  );

  // Handlers
  const handleCreatePayroll = async (data: PayrollCreate) => {
    try {
      const result = await createPayrollMutation.mutateAsync(data);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleUpdatePayroll = async (id: number, data: PayrollUpdate) => {
    await updatePayrollMutation.mutateAsync({ id, data });
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id,
        data: { status: status as PayrollStatusEnum },
      });
    } catch (error) {
      // Error toast is handled by useMutationWithSuccessToast
      throw error;
    }
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
      return await handleUpdatePayroll(
        selectedPayroll.payroll_id,
        data as PayrollUpdate
      );
    } else {
      // Create new payroll
      return await handleCreatePayroll(data as PayrollCreate);
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
    payrollPage,
    setPayrollPage,
    totalCount,
    totalPages,
    pageSize,
    setPageSize,

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
