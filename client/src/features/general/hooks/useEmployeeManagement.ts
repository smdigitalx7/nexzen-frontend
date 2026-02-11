import { useState, useMemo, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { startTransition } from "react";
import { useAuthStore } from "@/core/auth/authStore";
import {
  useTabNavigation,
  useTabEnabled,
} from "@/common/hooks/use-tab-navigation";
import { toast } from "@/common/hooks/use-toast";
import { invalidateQueriesSelective } from "@/common/hooks/useGlobalRefetch";
import {
  useEmployeesByBranch,
  useEmployee,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
  useUpdateEmployeeStatus,
  employeeKeys,
} from "@/features/general/hooks/useEmployees";
import {
  useAttendanceAll,
  useAttendance,
  useCreateAttendance,
  useUpdateAttendance,
  useUpdateIndividualAttendance,
  useDeleteAttendance,
  useAttendanceByBranch,
  employeeAttendanceKeys,
} from "@/features/general/hooks/useEmployeeAttendance";
import { EmployeeAttendanceService } from "@/features/general/services/employee-attendance.service";
import {
  useEmployeeLeaves,
  useEmployeeLeavesByBranch,
  useEmployeeLeaveById,
  useCreateEmployeeLeave,
  useUpdateEmployeeLeave,
  useApproveEmployeeLeave,
  useRejectEmployeeLeave,
  useDeleteEmployeeLeave,
  employeeLeaveKeys,
} from "@/features/general/hooks/useEmployeeLeave";
import {
  useAdvancesAll,
  useAdvancesByBranch,
  useAdvance,
  useCreateAdvance,
  useUpdateAdvance,
  useUpdateAdvanceStatus,
  useUpdateAdvanceAmountPaid,
  advanceKeys,
} from "@/features/general/hooks/useAdvances";
import {
  EmployeeRead as LibEmployeeRead,
  EmployeeCreate,
  EmployeeUpdate,
} from "@/features/general/types/employees";
import {
  EmployeeAttendanceCreate,
  EmployeeAttendanceUpdate,
} from "@/features/general/types/employee-attendance";
import {
  EmployeeLeaveCreate,
  EmployeeLeaveUpdate,
  EmployeeLeaveReject,
} from "@/features/general/types/employee-leave";
import {
  AdvanceCreate,
  AdvanceUpdate,
  AdvanceStatusUpdate,
  AdvanceAmountPaidUpdate,
  AdvanceRead as LibAdvanceRead,
} from "@/features/general/types/advances";

// Types
// Use the canonical EmployeeRead from lib/types which matches the API response
export type EmployeeRead = LibEmployeeRead;

export interface EmployeeAttendanceRead {
  attendance_id: number;
  employee_id: number;
  // Backend returns attendance_month as number (1-12), but handle both formats for compatibility
  attendance_month: number | string; // Can be number (1-12) or string (YYYY-MM-DD)
  attendance_year?: number | string; // Can be number or string
  total_working_days: number;
  days_present: number;
  days_absent: number;
  paid_leaves: number;
  unpaid_leaves: number;
  late_arrivals?: number;
  early_departures?: number;
  created_at?: string;
  updated_at?: string;
  employee_name?: string;
}

export interface EmployeeLeaveRead {
  leave_id: number;
  employee_id: number;
  leave_type: "PAID" | "UNPAID";
  from_date: string;
  to_date: string;
  total_days: number;
  reason: string;
  leave_status: "PENDING" | "APPROVED" | "REJECTED";
  applied_date: string;
  approved_date?: string;
  rejected_date?: string;
  approved_by?: number;
  rejected_by?: number;
  notes?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

// Use the lib type which matches what the API actually returns
export type AdvanceRead = LibAdvanceRead;

/**
 * Helper to clean up global UI state after dialog operations.
 * Resolves "aria-hidden" accessibility issues and UI freezes caused by dialog locks.
 * Use "!important" to override any lingering Radix UI inline styles.
 */
import { cleanupDialogState } from "@/common/utils/ui-cleanup";

export const useEmployeeManagement = (
  viewMode: "branch" | "institute" = "branch"
) => {
  const queryClient = useQueryClient();
  const { user, currentBranch } = useAuthStore();
  const { activeTab, setActiveTab } = useTabNavigation("employees");

  // Get enabled states for conditional data fetching (avoids hook order issues)
  // Employees needed for multiple tabs (employees, attendance, leaves, advances)
  const employeesEnabled = useTabEnabled(
    ["employees", "attendance", "leaves", "advances"],
    "employees"
  );
  const attendanceEnabled = useTabEnabled("attendance", "employees");
  const leavesEnabled = useTabEnabled("leaves", "employees");
  const advancesEnabled = useTabEnabled("advances", "employees");

  // UI State - Initialize month/year to current values (required parameters)
  const now = new Date();
  const [attendancePage, setAttendancePage] = useState(1);
  const [leavesPage, setLeavesPage] = useState(1);
  const [advancesPage, setAdvancesPage] = useState(1);
  const [attendanceMonth, setAttendanceMonth] = useState<number>(
    now.getMonth() + 1
  );
  const [attendanceYear, setAttendanceYear] = useState<number>(
    now.getFullYear()
  );
  const [leaveMonth, setLeaveMonth] = useState<number>(now.getMonth() + 1);
  const [leaveYear, setLeaveYear] = useState<number>(now.getFullYear());
  const [employeesPage, setEmployeesPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Data hooks - API calls are made per tab, not based on sidebar navigation
  // Only fetch data when the respective tab is active to prevent unnecessary requests and UI freezes
  // Note: Employees are needed for dialogs across multiple tabs, so enabled when any relevant tab is active
  const {
    data: employeesData,
    isLoading,
    error,
  } = useEmployeesByBranch(employeesEnabled, employeesPage, pageSize);

  // ✅ FIX: Handle both direct array and wrapped response formats
  const employees = useMemo(() => {
    if (!employeesData) return [];
    const raw: any = employeesData;
    // Handle case where API returns direct array
    if (Array.isArray(raw)) return raw;
    // Handle case where API returns { data: [...], total_count: ... }
    if (raw && typeof raw === "object" && Array.isArray(raw.data)) {
      return raw.data as EmployeeRead[];
    }
    return [];
  }, [employeesData]);

  const totalEmployeesCount = useMemo(() => {
    if (!employeesData) return 0;
    const raw: any = employeesData;
    if (Array.isArray(raw)) return raw.length;
    return raw.total_count || 0;
  }, [employeesData]);

  const totalEmployeesPages = useMemo(() => {
    if (!employeesData) return 0;
    const raw: any = employeesData;
    if (Array.isArray(raw)) return 1;
    return raw.total_pages || Math.ceil((raw.total_count || 0) / pageSize);
  }, [employeesData]);

  // Only fetch attendance when attendance tab is active
  const { data: attendanceData, isLoading: attendanceLoading } =
    useAttendanceByBranch(attendanceMonth, attendanceYear, pageSize, attendancePage, attendanceEnabled);

  // Only fetch leaves when leaves tab is active
  const {
    data: leavesData,
    isLoading: leavesLoading,
    refetch: refetchLeaves,
  } = useEmployeeLeavesByBranch(
    leaveMonth,
    leaveYear,
    pageSize,
    leavesPage,
    undefined, // leaveStatus
    leavesEnabled // Only fetch when leaves tab is active
  );

  // Extract data from response objects
  const attendance = attendanceData?.data || [];
  const leaves = leavesData?.data || [];

  // Only fetch advances when advances tab is active
  const { data: advancesData, isLoading: advancesLoading } =
    useAdvancesByBranch(
      pageSize,
      advancesPage, // advancesPage - pagination from state
      undefined, // month
      undefined, // year
      undefined, // status
      advancesEnabled // Only fetch when advances tab is active
    );
  const advances = advancesData?.data || [];

  // Mutation hooks
  const createEmployeeMutation = useCreateEmployee();
  const updateEmployeeMutation = useUpdateEmployee();
  const deleteEmployeeMutation = useDeleteEmployee();
  const updateStatusMutation = useUpdateEmployeeStatus();

  const createAttendanceMutation = useCreateAttendance();
  const updateAttendanceMutation = useUpdateAttendance();
  const updateIndividualAttendanceMutation = useUpdateIndividualAttendance();
  const deleteAttendanceMutation = useDeleteAttendance();

  const createLeaveMutation = useCreateEmployeeLeave();
  const updateLeaveMutation = useUpdateEmployeeLeave();
  const deleteLeaveMutation = useDeleteEmployeeLeave();
  const approveLeaveMutation = useApproveEmployeeLeave();
  const rejectLeaveMutation = useRejectEmployeeLeave();

  const createAdvanceMutation = useCreateAdvance();
  const updateAdvanceMutation = useUpdateAdvance();
  const updateAdvanceStatusMutation = useUpdateAdvanceStatus();
  const updateAdvanceAmountPaidMutation = useUpdateAdvanceAmountPaid();

  // Employee form state
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [isEditingEmployee, setIsEditingEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRead | null>(
    null
  );
  const [showEmployeeDetail, setShowEmployeeDetail] = useState(false);
  const [showDeleteEmployeeDialog, setShowDeleteEmployeeDialog] =
    useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeRead | null>(
    null
  );
  const [newStatus, setNewStatus] = useState<string>("ACTIVE");

  // Attendance form state
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [showAttendanceBulkCreateDialog, setShowAttendanceBulkCreateDialog] =
    useState(false);
  const [isBulkCreatingAttendance, setIsBulkCreatingAttendance] =
    useState(false);
  const [showAttendanceViewDialog, setShowAttendanceViewDialog] =
    useState(false);
  const [attendanceToView, setAttendanceToView] =
    useState<EmployeeAttendanceRead | null>(null);
  const [isEditingAttendance, setIsEditingAttendance] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] =
    useState<EmployeeAttendanceRead | null>(null);
  const [showAttendanceDeleteDialog, setShowAttendanceDeleteDialog] =
    useState(false);
  const [attendanceFormData, setAttendanceFormData] = useState({
    employee_id: 0,
    attendance_month: new Date().toISOString().split("T")[0],
    total_working_days: 0,
  });

  // Leave form state
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showLeaveViewDialog, setShowLeaveViewDialog] = useState(false);
  const [leaveToView, setLeaveToView] = useState<EmployeeLeaveRead | null>(
    null
  );
  const [isEditingLeave, setIsEditingLeave] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState<EmployeeLeaveRead | null>(
    null
  );
  const [showLeaveDeleteDialog, setShowLeaveDeleteDialog] = useState(false);
  const [showLeaveApproveDialog, setShowLeaveApproveDialog] = useState(false);
  const [showLeaveRejectDialog, setShowLeaveRejectDialog] = useState(false);
  const [leaveToApprove, setLeaveToApprove] =
    useState<EmployeeLeaveRead | null>(null);
  const [leaveToReject, setLeaveToReject] = useState<EmployeeLeaveRead | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [leaveFormData, setLeaveFormData] = useState<EmployeeLeaveCreate>({
    employee_id: 0,
    leave_type: "PAID",
    from_date: new Date().toISOString().split("T")[0],
    to_date: new Date().toISOString().split("T")[0],
    reason: "",
    total_days: 1,
    applied_date: new Date().toISOString().split("T")[0],
  });

  // Advance form state
  const [showAdvanceForm, setShowAdvanceForm] = useState(false);
  const [showAdvanceViewDialog, setShowAdvanceViewDialog] = useState(false);
  const [advanceToView, setAdvanceToView] = useState<AdvanceRead | null>(null);
  const [isEditingAdvance, setIsEditingAdvance] = useState(false);
  const [advanceToDelete, setAdvanceToDelete] = useState<AdvanceRead | null>(
    null
  );
  const [showAdvanceDeleteDialog, setShowAdvanceDeleteDialog] = useState(false);
  const [showAdvanceStatusDialog, setShowAdvanceStatusDialog] = useState(false);
  const [showAdvanceAmountDialog, setShowAdvanceAmountDialog] = useState(false);
  const [showAdvanceVoucherDialog, setShowAdvanceVoucherDialog] =
    useState(false);
  const [advanceForVoucher, setAdvanceForVoucher] =
    useState<AdvanceRead | null>(null);
  const [advanceToUpdate, setAdvanceToUpdate] = useState<AdvanceRead | null>(
    null
  );
  const [advanceStatus, setAdvanceStatus] = useState<string>("");
  const [advanceStatusReason, setAdvanceStatusReason] = useState<string>("");
  const [advanceFormData, setAdvanceFormData] = useState<AdvanceCreate>({
    employee_id: 0,
    advance_date: new Date().toISOString().split("T")[0],
    advance_amount: 0,
    request_reason: "",
  });

  // ✅ FIX: Memoize expensive data transformations
  // Flatten and enrich attendance data with employee names
  const flattenedAttendance = useMemo(() => {
    const attendanceArray = Array.isArray(attendance) ? attendance : [];
    
    // Check if it's already flat (new API format)
    if (attendanceArray.length > 0 && !('attendances' in attendanceArray[0])) {
         return attendanceArray;
    }

    return attendanceArray.flatMap(
      (monthGroup: any) => (Array.isArray(monthGroup?.attendances) ? monthGroup.attendances : [])
    );
  }, [attendance]);

  // ✅ FIX: Ensure employees is always an array
  const employeesArray = useMemo(() => {
    return Array.isArray(employees) ? employees : [];
  }, [employees]);

  const enrichedAttendance = useMemo(() => {
    return flattenedAttendance.map((attendanceRecord: any) => {
      const employee = employeesArray.find(
        (emp) => emp.employee_id === attendanceRecord.employee_id
      );
      return {
        ...attendanceRecord,
        employee_name:
          employee?.employee_name ||
          attendanceRecord.employee_name ||
          `Employee ${attendanceRecord.employee_id}`,
      } as EmployeeAttendanceRead;
    });
  }, [flattenedAttendance, employeesArray]);

  // ✅ FIX: Memoize computed values

  // Computed values
  const totalEmployees = useMemo(() => totalEmployeesCount, [totalEmployeesCount]);
  const activeEmployees = useMemo(() => {
    return employeesArray.filter((emp) => emp.status === "ACTIVE").length;
  }, [employeesArray]);
  
  // Use API returned totals for server-side pagination
  const totalAttendance = attendanceData?.total || 0;
  // Use API returned total_pages directly
  const totalAttendancePages = (attendanceData as any)?.total_pages || Math.ceil(totalAttendance / pageSize) || 1;

  const presentToday = 0; // Not applicable with monthly aggregates
  
  const pendingLeaves = useMemo(() => {
    // This calculation is only accurate for the currently fetched page
    // Ideally backend should provide this count separately
    const leavesArray = Array.isArray(leaves) ? leaves : [];
    return leavesArray.filter((leave: any) => leave.leave_status === "PENDING")
      .length;
  }, [leaves]);

  const totalLeaves = leavesData?.total || 0;
  const totalLeavesPages = leavesData?.pages || Math.ceil(totalLeaves / pageSize) || 1;

  const totalAdvances = advancesData?.total || 0;
  const totalAdvancesPages = advancesData?.pages || Math.ceil(totalAdvances / pageSize) || 1;

  const pendingAdvances = useMemo(() => {
    // Only accurate for current page
    const advancesArray = Array.isArray(advances) ? advances : [];
    return advancesArray.filter((adv: any) => adv.status === "REQUESTED").length;
  }, [advances]);

  // Pagination - Data is already paginated by API
  const paginatedAttendance = enrichedAttendance;
  const paginatedLeaves = leaves;
  const paginatedAdvances = advances;

  // Business logic functions
  // ✅ CRITICAL: Support manual refetching with delay
  const refetchAdvances = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        queryClient.refetchQueries({
          queryKey: advanceKeys.all,
          exact: false,
          type: "active",
        });
      }, 300);
    });
  };

  /**
   * ✅ GLOBAL MODAL GUARDIAN
   * This effect monitors all modal states. When ALL modals are closed, 
   * it ensures the UI is actually unlocked. This is a failsafe for 
   * Radix UI's occasional failure to clean up after rapid transitions.
   */
  useEffect(() => {
    const anyModalOpen = 
      showEmployeeForm || showEmployeeDetail || showDeleteEmployeeDialog ||
      showAttendanceForm || showAttendanceBulkCreateDialog || showAttendanceViewDialog || showAttendanceDeleteDialog ||
      showLeaveForm || showLeaveViewDialog || showLeaveDeleteDialog || showLeaveApproveDialog || showLeaveRejectDialog ||
      showAdvanceForm || showAdvanceViewDialog || showAdvanceStatusDialog || showAdvanceAmountDialog || showAdvanceVoucherDialog;

    if (!anyModalOpen) {
      // Small delay to allow Radix UI to finish its internal transition
      const timer = setTimeout(() => {
        cleanupDialogState();
      }, 100);
      
      const longTimer = setTimeout(() => {
        cleanupDialogState();
      }, 500);

      return () => {
        clearTimeout(timer);
        clearTimeout(longTimer);
      };
    }
  }, [
    showEmployeeForm, showEmployeeDetail, showDeleteEmployeeDialog,
    showAttendanceForm, showAttendanceBulkCreateDialog, showAttendanceViewDialog, showAttendanceDeleteDialog,
    showLeaveForm, showLeaveViewDialog, showLeaveDeleteDialog, showLeaveApproveDialog, showLeaveRejectDialog,
    showAdvanceForm, showAdvanceViewDialog, showAdvanceStatusDialog, showAdvanceAmountDialog, showAdvanceVoucherDialog
  ]);

  const handleCreateEmployee = (data: EmployeeCreate) => {
    // ✅ PHASE 2: Close immediately and cleanup state synchronously
    setShowEmployeeForm(false);
    cleanupDialogState();

    try {
      createEmployeeMutation.mutate(data, {
        onSuccess: () => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              queryClient.refetchQueries({ queryKey: employeeKeys.all });
            }, 300);
          });
        }
      });
    } catch (error) {
      console.error("Error creating employee:", error);
    }
  };

  const handleUpdateEmployee = (id: number, data: EmployeeUpdate) => {
    // ✅ PHASE 2: Close immediately and cleanup state synchronously
    setShowEmployeeForm(false);
    setIsEditingEmployee(false);
    cleanupDialogState();

    try {
      updateEmployeeMutation.mutate({ id, payload: data }, {
        onSuccess: () => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              queryClient.refetchQueries({ queryKey: employeeKeys.all });
            }, 300);
          });
        }
      });
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

  const handleDeleteEmployee = (id: number) => {
    // ✅ PHASE 2: Close immediately and cleanup state synchronously
    setShowDeleteEmployeeDialog(false);
    cleanupDialogState();

    try {
      deleteEmployeeMutation.mutate(id, {
        onSuccess: () => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              queryClient.refetchQueries({ queryKey: employeeKeys.all });
            }, 300);
          });
        }
      });
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  const handleUpdateEmployeeStatus = (id: number, status: string) => {
    // ✅ PHASE 2: Close immediately and cleanup state synchronously
    cleanupDialogState();

    try {
      updateStatusMutation.mutate({ id, status }, {
        onSuccess: () => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              queryClient.refetchQueries({ queryKey: employeeKeys.all });
            }, 300);
          });
        }
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleCreateAttendance = (data: {
    employee_id: number;
    total_working_days: number;
    month: number;
    year: number;
  }) => {
    // ✅ PHASE 2: Close immediately and cleanup state synchronously
    setShowAttendanceForm(false);
    cleanupDialogState();

    try {
      // RUN IN BACKGROUND
      EmployeeAttendanceService.create(data).then(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            queryClient.refetchQueries({ queryKey: employeeAttendanceKeys.all });
          }, 300);
        });
      });
    } catch (error) {
      console.error("Error creating attendance:", error);
    }
  };

  const handleBulkCreateAttendance = (data: {
    total_working_days: number;
    month: number;
    year: number;
  }) => {
    // ✅ PHASE 2: Close immediately and cleanup state synchronously
    setShowAttendanceBulkCreateDialog(false);
    setIsBulkCreatingAttendance(true);
    cleanupDialogState();

    try {
      // RUN IN BACKGROUND
      EmployeeAttendanceService.createBulk(data).then(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            queryClient.refetchQueries({ queryKey: employeeAttendanceKeys.all });
          }, 300);
        });
      }).finally(() => {
        setIsBulkCreatingAttendance(false);
      });
    } catch (error) {
      console.error("Error creating bulk attendance:", error);
      setIsBulkCreatingAttendance(false);
    }
  };

  const handleUpdateAttendance = (
    employeeId: number,
    month: number,
    year: number
  ) => {
    // ✅ PHASE 2: Close immediately and cleanup state synchronously
    setShowAttendanceForm(false);
    setIsEditingAttendance(false);
    cleanupDialogState();

    try {
      // RUN IN BACKGROUND
      updateIndividualAttendanceMutation.mutate({
        employee_id: employeeId,
        month,
        year,
      }, {
        onSuccess: () => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              queryClient.refetchQueries({ queryKey: employeeAttendanceKeys.all });
            }, 300);
          });
        }
      });
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  const handleUpdateAttendanceBulk = (data: {
    total_working_days: number;
    month: number;
    year: number;
  }) => {
    // ✅ PHASE 2: Close immediately and cleanup state synchronously
    setShowAttendanceForm(false);
    setIsEditingAttendance(false);
    cleanupDialogState();

    try {
      // RUN IN BACKGROUND
      EmployeeAttendanceService.updateBulk(data).then(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            queryClient.refetchQueries({ queryKey: employeeAttendanceKeys.all });
          }, 300);
        });
      });
    } catch (error) {
      console.error("Error updating attendance bulk:", error);
    }
  };

  const handleDeleteAttendance = (id: number) => {
    // ✅ PHASE 2: Close immediately and cleanup state synchronously
    setShowAttendanceDeleteDialog(false);
    cleanupDialogState();

    try {
      // RUN IN BACKGROUND
      deleteAttendanceMutation.mutate(id, {
        onSuccess: () => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              queryClient.refetchQueries({ queryKey: employeeAttendanceKeys.all });
            }, 300);
          });
        }
      });
    } catch (error) {
      console.error("Error deleting attendance:", error);
    }
  };

  const handleViewAttendance = (attendance: EmployeeAttendanceRead) => {
    setAttendanceToView(attendance);
    setShowAttendanceViewDialog(true);
  };

  const handleCreateLeave = (data: EmployeeLeaveCreate) => {
    // ✅ PHASE 2: Close immediately and cleanup state synchronously
    setShowLeaveForm(false);
    cleanupDialogState();

    try {
      // RUN IN BACKGROUND
      createLeaveMutation.mutate(data, {
        onSuccess: () => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              queryClient.refetchQueries({ queryKey: employeeLeaveKeys.all });
            }, 300);
          });
        }
      });
    } catch (error) {
      console.error("Error creating leave:", error);
    }
  };

  const handleUpdateLeave = (id: number, data: EmployeeLeaveUpdate) => {
    // ✅ PHASE 2: Close immediately and cleanup state synchronously
    setShowLeaveForm(false);
    setIsEditingLeave(false);
    cleanupDialogState();

    try {
      // RUN IN BACKGROUND
      updateLeaveMutation.mutate({ id, data }, {
        onSuccess: () => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              queryClient.refetchQueries({ queryKey: employeeLeaveKeys.all });
            }, 300);
          });
        }
      });
    } catch (error) {
      console.error("Error updating leave:", error);
    }
  };

  const handleDeleteLeave = (id: number) => {
    // ✅ PHASE 2: Close immediately and cleanup state synchronously
    setShowLeaveDeleteDialog(false);
    cleanupDialogState();

    try {
      // RUN IN BACKGROUND
      deleteLeaveMutation.mutate(id, {
        onSuccess: () => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              queryClient.refetchQueries({ queryKey: employeeLeaveKeys.all });
            }, 300);
          });
        }
      });
    } catch (error) {
      console.error("Error deleting leave:", error);
    }
  };

  const handleApproveLeave = (id: number, notes?: string) => {
    // ✅ CRITICAL FIX: Close dialog immediately (optimistic) before mutation starts
    // This prevents UI freeze by allowing dialog to close while mutation runs in background
    setShowLeaveApproveDialog(false);

    // ✅ CRITICAL FIX: Clear leave data immediately
    setLeaveToApprove(null);

    // Clean up accessibility and global UI state
    cleanupDialogState();

    try {
      // Run mutation in background - don't await it to block UI
      approveLeaveMutation.mutate(id, {
        onError: (error) => {
          console.error("Error approving leave:", error);
        },
      });
    } catch (error) {
      console.error("Error approving leave:", error);
    }
  };

  const handleRejectLeave = (id: number, reason: string) => {
    // ✅ CRITICAL FIX: Close dialog immediately (optimistic) before mutation starts
    // This prevents UI freeze by allowing dialog to close while mutation runs in background
    setShowLeaveRejectDialog(false);

    // ✅ CRITICAL FIX: Clear leave data and rejection reason immediately
    setLeaveToReject(null);
    setRejectionReason("");

    // Clean up accessibility and global UI state
    cleanupDialogState();

    try {
      // Run mutation in background - don't await it to block UI
      rejectLeaveMutation.mutate(
        {
          id,
          data: { rejection_reason: reason },
        },
        {
          onError: (error) => {
            console.error("Error rejecting leave:", error);
          },
        }
      );
    } catch (error) {
      console.error("Error rejecting leave:", error);
    }
  };

  const handleViewLeave = (leave: EmployeeLeaveRead) => {
    setLeaveToView(leave);
    setShowLeaveViewDialog(true);
  };

  const handleCreateAdvance = (data: AdvanceCreate) => {
    // ✅ PHASE 2: Close immediately and cleanup state synchronously
    setShowAdvanceForm(false);
    cleanupDialogState();

    try {
      // RUN MUTATION IN BACKGROUND
      createAdvanceMutation.mutate(data, {
        onSuccess: () => refetchAdvances()
      });
    } catch (error) {
      console.error("Error creating advance:", error);
    }
  };

  const handleUpdateAdvance = (id: number, data: AdvanceUpdate) => {
    // ✅ PHASE 2: Close immediately and cleanup state synchronously
    setShowAdvanceForm(false);
    setIsEditingAdvance(false);
    cleanupDialogState();

    try {
      // RUN MUTATION IN BACKGROUND
      updateAdvanceMutation.mutate({ id, payload: data }, {
        onSuccess: () => refetchAdvances()
      });
    } catch (error) {
      console.error("Error updating advance:", error);
    }
  };

  const handleUpdateAdvanceStatus = (
    id: number,
    status: string,
    reason?: string
  ) => {
    // ✅ PHASE 2: Close immediately and cleanup state synchronously
    setShowAdvanceStatusDialog(false);
    setAdvanceStatus("");
    setAdvanceStatusReason("");
    cleanupDialogState();

    try {
      const payload: AdvanceStatusUpdate = {
        status,
        ...(reason && { request_reason: reason }),
      };

      // RUN MUTATION IN BACKGROUND
      updateAdvanceStatusMutation.mutate({ id, payload }, {
        onSuccess: () => refetchAdvances()
      });
    } catch (error) {
      console.error("Error updating advance status:", error);
    }
  };

  const handleUpdateAdvanceAmountPaid = (id: number, amount: number) => {
    // ✅ PHASE 2: Close immediately and cleanup state synchronously
    setShowAdvanceAmountDialog(false);
    cleanupDialogState();

    try {
      const payload: AdvanceAmountPaidUpdate = { amount_paid: amount };
      
      // RUN MUTATION IN BACKGROUND - DON'T AWAIT
      updateAdvanceAmountPaidMutation.mutate({
        id,
        payload,
      }, {
        onSuccess: () => {
          // Selective invalidation already handled in useUpdateAdvanceAmountPaid hook
          // but we can force a refetch with delay for extra safety
          refetchAdvances();
        },
        onError: (error) => {
          console.error("Error updating advance amount:", error);
        }
      });
    } catch (error) {
      console.error("Error updating advance amount:", error);
    }
  };

  return {
    // Data
    employees: employeesArray,
    attendance: enrichedAttendance,
    leaves: paginatedLeaves,
    advances: paginatedAdvances,

    // Loading states
    isLoading,
    error,
    attendanceLoading,
    leavesLoading,
    advancesLoading,

    // Computed values
    totalEmployees,
    activeEmployees,
    totalAttendance,
    presentToday,
    pendingLeaves,
    totalLeaves, // Added
    totalAdvances,
    pendingAdvances,

    // UI State
    activeTab,
    setActiveTab,
    employeesPage,
    setEmployeesPage,
    totalEmployeesPages,
    attendancePage,
    leavesPage,
    advancesPage,
    setAttendancePage,
    setLeavesPage,
    setAdvancesPage,
    totalAttendancePages, // Added
    totalLeavesPages, // Added
    totalAdvancesPages, // Added
    pageSize,
    setPageSize,
    attendanceMonth,
    setAttendanceMonth,
    attendanceYear,
    setAttendanceYear,
    leaveMonth,
    setLeaveMonth,
    leaveYear,
    setLeaveYear,

    // Employee state
    showEmployeeForm,
    setShowEmployeeForm,
    isEditingEmployee,
    setIsEditingEmployee,
    selectedEmployee,
    setSelectedEmployee,
    showEmployeeDetail,
    setShowEmployeeDetail,
    showDeleteEmployeeDialog,
    setShowDeleteEmployeeDialog,
    employeeToDelete,
    setEmployeeToDelete,
    newStatus,
    setNewStatus,

    // Attendance state
    showAttendanceForm,
    setShowAttendanceForm,
    showAttendanceBulkCreateDialog,
    setShowAttendanceBulkCreateDialog,
    isBulkCreatingAttendance,
    showAttendanceViewDialog,
    setShowAttendanceViewDialog,
    attendanceToView,
    setAttendanceToView,
    isEditingAttendance,
    setIsEditingAttendance,
    attendanceToDelete,
    setAttendanceToDelete,
    showAttendanceDeleteDialog,
    setShowAttendanceDeleteDialog,
    attendanceFormData,
    setAttendanceFormData,

    // Leave state
    showLeaveForm,
    setShowLeaveForm,
    showLeaveViewDialog,
    setShowLeaveViewDialog,
    leaveToView,
    setLeaveToView,
    isEditingLeave,
    setIsEditingLeave,
    leaveToDelete,
    setLeaveToDelete,
    showLeaveDeleteDialog,
    setShowLeaveDeleteDialog,
    showLeaveApproveDialog,
    setShowLeaveApproveDialog,
    showLeaveRejectDialog,
    setShowLeaveRejectDialog,
    leaveToApprove,
    setLeaveToApprove,
    leaveToReject,
    setLeaveToReject,
    rejectionReason,
    setRejectionReason,
    leaveFormData,
    setLeaveFormData,

    // Advance state
    showAdvanceForm,
    setShowAdvanceForm,
    showAdvanceViewDialog,
    setShowAdvanceViewDialog,
    advanceToView,
    setAdvanceToView,
    isEditingAdvance,
    setIsEditingAdvance,
    advanceToDelete,
    setAdvanceToDelete,
    showAdvanceDeleteDialog,
    setShowAdvanceDeleteDialog,
    showAdvanceStatusDialog,
    setShowAdvanceStatusDialog,
    showAdvanceAmountDialog,
    setShowAdvanceAmountDialog,
    showAdvanceVoucherDialog,
    setShowAdvanceVoucherDialog,
    advanceForVoucher,
    setAdvanceForVoucher,
    advanceToUpdate,
    setAdvanceToUpdate,
    advanceStatus,
    setAdvanceStatus,
    advanceStatusReason,
    setAdvanceStatusReason,
    advanceFormData,
    setAdvanceFormData,

    // Business logic
    handleCreateEmployee,
    handleUpdateEmployee,
    handleDeleteEmployee,
    handleUpdateEmployeeStatus,
    handleCreateAttendance,
    handleBulkCreateAttendance,
    handleUpdateAttendance,
    handleUpdateAttendanceBulk,
    handleDeleteAttendance,
    handleViewAttendance,
    handleCreateLeave,
    handleUpdateLeave,
    handleDeleteLeave,
    handleApproveLeave,
    handleRejectLeave,
    handleViewLeave,
    handleCreateAdvance,
    handleUpdateAdvance,
    handleUpdateAdvanceStatus,
    handleUpdateAdvanceAmountPaid,

    // User context
    user,
    currentBranch,

    // Mutation loading states
    createEmployeePending: createEmployeeMutation.isPending,
    updateEmployeePending: updateEmployeeMutation.isPending,
    approveLeavePending: approveLeaveMutation.isPending,
    rejectLeavePending: rejectLeaveMutation.isPending,
  };
};
