import { useState, useMemo, useCallback } from "react";
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
  const pageSize = 20;

  // Data hooks - API calls are made per tab, not based on sidebar navigation
  // Only fetch data when the respective tab is active to prevent unnecessary requests and UI freezes
  // Note: Employees are needed for dialogs across multiple tabs, so enabled when any relevant tab is active
  const {
    data: employees = [],
    isLoading,
    error,
  } = useEmployeesByBranch(employeesEnabled);

  // Only fetch attendance when attendance tab is active
  const { data: attendanceData, isLoading: attendanceLoading } =
    useAttendanceByBranch(attendanceMonth, attendanceYear, attendanceEnabled);

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
      1, // advancesPage - pagination can be added when needed
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
    return attendance.flatMap(
      (monthGroup: any) => monthGroup.attendances || []
    );
  }, [attendance]);

  const enrichedAttendance = useMemo(() => {
    return flattenedAttendance.map((attendanceRecord: any) => {
      const employee = employees.find(
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
  }, [flattenedAttendance, employees]);

  // ✅ FIX: Memoize computed values
  // Computed values
  const totalEmployees = useMemo(() => employees.length, [employees.length]);
  const activeEmployees = useMemo(() => {
    return employees.filter((emp) => emp.status === "ACTIVE").length;
  }, [employees]);
  const totalAttendance = useMemo(
    () => flattenedAttendance.length,
    [flattenedAttendance.length]
  );
  const presentToday = 0; // Not applicable with monthly aggregates
  const pendingLeaves = useMemo(() => {
    return leaves.filter((leave: any) => leave.leave_status === "PENDING")
      .length;
  }, [leaves]);
  const totalAdvances = useMemo(() => {
    return Array.isArray(advances) ? advances.length : 0;
  }, [advances]);
  const pendingAdvances = useMemo(() => {
    return Array.isArray(advances)
      ? advances.filter((adv: any) => adv.status === "PENDING").length
      : 0;
  }, [advances]);

  // Pagination
  const paginatedAttendance = useMemo(() => {
    const start = (attendancePage - 1) * pageSize;
    return enrichedAttendance.slice(start, start + pageSize);
  }, [enrichedAttendance, attendancePage, pageSize]);

  const paginatedLeaves = useMemo(() => {
    const start = (leavesPage - 1) * pageSize;
    return leaves.slice(start, start + pageSize);
  }, [leaves, leavesPage, pageSize]);

  const paginatedAdvances = useMemo(() => {
    const start = (advancesPage - 1) * pageSize;
    return Array.isArray(advances)
      ? advances.slice(start, start + pageSize)
      : [];
  }, [advances, advancesPage, pageSize]);

  // Business logic functions
  const handleCreateEmployee = async (data: EmployeeCreate) => {
    try {
      await createEmployeeMutation.mutateAsync(data);
      setShowEmployeeForm(false);

      // ✅ FIX: Use selective invalidation to prevent UI freeze
      invalidateQueriesSelective(employeeKeys.all, {
        refetchType: "none",
        delay: 0,
      });

      // Manually refetch with delay
      requestAnimationFrame(() => {
        setTimeout(() => {
          queryClient.refetchQueries({
            queryKey: employeeKeys.all,
            exact: false,
            type: "active",
          });
        }, 200);
      });
    } catch (error) {
      console.error("Error creating employee:", error);
    }
  };

  const handleUpdateEmployee = async (id: number, data: EmployeeUpdate) => {
    try {
      await updateEmployeeMutation.mutateAsync({ id, payload: data });
      setShowEmployeeForm(false);
      setIsEditingEmployee(false);

      // ✅ FIX: Use selective invalidation to prevent UI freeze
      invalidateQueriesSelective(employeeKeys.all, {
        refetchType: "none",
        delay: 0,
      });

      // Manually refetch with delay
      requestAnimationFrame(() => {
        setTimeout(() => {
          queryClient.refetchQueries({
            queryKey: employeeKeys.all,
            exact: false,
            type: "active",
          });
        }, 200);
      });
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    try {
      await deleteEmployeeMutation.mutateAsync(id);
      setShowDeleteEmployeeDialog(false);

      // ✅ FIX: Use selective invalidation to prevent UI freeze
      invalidateQueriesSelective(employeeKeys.all, {
        refetchType: "none",
        delay: 0,
      });

      // Manually refetch with delay
      requestAnimationFrame(() => {
        setTimeout(() => {
          queryClient.refetchQueries({
            queryKey: employeeKeys.all,
            exact: false,
            type: "active",
          });
        }, 200);
      });
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  const handleUpdateEmployeeStatus = async (id: number, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });

      // ✅ FIX: Use selective invalidation to prevent UI freeze
      invalidateQueriesSelective(employeeKeys.all, {
        refetchType: "none",
        delay: 0,
      });

      // Manually refetch with delay
      requestAnimationFrame(() => {
        setTimeout(() => {
          queryClient.refetchQueries({
            queryKey: employeeKeys.all,
            exact: false,
            type: "active",
          });
        }, 200);
      });
    } catch (error) {
      console.error("Error updating employee status:", error);
    }
  };

  const handleCreateAttendance = async (data: {
    employee_id: number;
    total_working_days: number;
    month: number;
    year: number;
  }) => {
    try {
      await EmployeeAttendanceService.create(data);
      setShowAttendanceForm(false);

      // ✅ FIX: Use selective invalidation to prevent UI freeze
      invalidateQueriesSelective(employeeAttendanceKeys.all, {
        refetchType: "none",
        delay: 0,
      });

      // Manually refetch with delay
      requestAnimationFrame(() => {
        setTimeout(() => {
          queryClient.refetchQueries({
            queryKey: employeeAttendanceKeys.all,
            exact: false,
            type: "active",
          });
        }, 200);
      });

      toast({
        title: "Attendance Created",
        description: "Attendance record has been created successfully.",
        variant: "success",
      });
    } catch (error: any) {
      console.error("Error creating attendance:", error);
      toast({
        title: "Error",
        description:
          error?.message ||
          "Failed to create attendance record. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleBulkCreateAttendance = async (data: {
    total_working_days: number;
    month: number;
    year: number;
  }) => {
    setIsBulkCreatingAttendance(true);
    try {
      await EmployeeAttendanceService.createBulk(data);
      setShowAttendanceBulkCreateDialog(false);

      // ✅ FIX: Use selective invalidation to prevent UI freeze
      invalidateQueriesSelective(employeeAttendanceKeys.all, {
        refetchType: "none",
        delay: 0,
      });

      // Manually refetch with delay
      requestAnimationFrame(() => {
        setTimeout(() => {
          queryClient.refetchQueries({
            queryKey: employeeAttendanceKeys.all,
            exact: false,
            type: "active",
          });
        }, 200);
      });

      toast({
        title: "Bulk Attendance Created",
        description:
          "Attendance records have been created successfully for all active employees.",
        variant: "success",
      });
    } catch (error: any) {
      console.error("Error creating bulk attendance:", error);
      toast({
        title: "Error",
        description:
          error?.message ||
          "Failed to create bulk attendance records. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsBulkCreatingAttendance(false);
    }
  };

  const handleUpdateAttendance = async (
    employeeId: number,
    month: number,
    year: number
  ) => {
    try {
      await updateIndividualAttendanceMutation.mutateAsync({
        employee_id: employeeId,
        month,
        year,
      });
      setShowAttendanceForm(false);
      setIsEditingAttendance(false);

      // ✅ FIX: Use selective invalidation to prevent UI freeze
      invalidateQueriesSelective(employeeAttendanceKeys.all, {
        refetchType: "none",
        delay: 0,
      });

      // Manually refetch with delay
      requestAnimationFrame(() => {
        setTimeout(() => {
          queryClient.refetchQueries({
            queryKey: employeeAttendanceKeys.all,
            exact: false,
            type: "active",
          });
        }, 200);
      });
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  const handleUpdateAttendanceBulk = async (data: {
    total_working_days: number;
    month: number;
    year: number;
  }) => {
    try {
      await EmployeeAttendanceService.updateBulk(data);
      setShowAttendanceForm(false);
      setIsEditingAttendance(false);

      // ✅ FIX: Use selective invalidation to prevent UI freeze
      invalidateQueriesSelective(employeeAttendanceKeys.all, {
        refetchType: "none",
        delay: 0,
      });

      // Manually refetch with delay
      requestAnimationFrame(() => {
        setTimeout(() => {
          queryClient.refetchQueries({
            queryKey: employeeAttendanceKeys.all,
            exact: false,
            type: "active",
          });
        }, 200);
      });

      toast({
        title: "Attendance Updated",
        description:
          "Attendance records have been updated successfully for all employees in the branch.",
        variant: "success",
      });
    } catch (error: any) {
      console.error("Error updating attendance:", error);
      toast({
        title: "Error",
        description:
          error?.message ||
          "Failed to update attendance records. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteAttendance = async (id: number) => {
    try {
      await deleteAttendanceMutation.mutateAsync(id);
      setShowAttendanceDeleteDialog(false);

      // ✅ FIX: Use selective invalidation to prevent UI freeze
      invalidateQueriesSelective(employeeAttendanceKeys.all, {
        refetchType: "none",
        delay: 0,
      });

      // Manually refetch with delay
      requestAnimationFrame(() => {
        setTimeout(() => {
          queryClient.refetchQueries({
            queryKey: employeeAttendanceKeys.all,
            exact: false,
            type: "active",
          });
        }, 200);
      });
    } catch (error) {
      console.error("Error deleting attendance:", error);
    }
  };

  const handleViewAttendance = (attendance: EmployeeAttendanceRead) => {
    setAttendanceToView(attendance);
    setShowAttendanceViewDialog(true);
  };

  const handleCreateLeave = async (data: EmployeeLeaveCreate) => {
    try {
      await createLeaveMutation.mutateAsync(data);
      setShowLeaveForm(false);

      // ✅ FIX: Note - invalidateEntity is already called in mutation hook's onSuccess
      // No need to invalidate here to prevent double invalidation
    } catch (error) {
      console.error("Error creating leave:", error);
    }
  };

  const handleUpdateLeave = async (id: number, data: EmployeeLeaveUpdate) => {
    try {
      await updateLeaveMutation.mutateAsync({ id, data });
      setShowLeaveForm(false);
      setIsEditingLeave(false);

      // Note: invalidateEntity is already called in the mutation hook's onSuccess
    } catch (error) {
      console.error("Error updating leave:", error);
    }
  };

  const handleDeleteLeave = async (id: number) => {
    try {
      await deleteLeaveMutation.mutateAsync(id);
      setShowLeaveDeleteDialog(false);

      // Note: invalidateEntity is already called in the mutation hook's onSuccess
    } catch (error) {
      console.error("Error deleting leave:", error);
    }
  };

  const handleApproveLeave = async (id: number, notes?: string) => {
    // ✅ CRITICAL FIX: Force remove aria-hidden from focused elements immediately
    const allElements = document.querySelectorAll('[aria-hidden="true"]');
    allElements.forEach((el) => {
      if (el.contains(document.activeElement)) {
        el.removeAttribute('aria-hidden');
      }
    });
    
    // ✅ CRITICAL FIX: Restore body overflow IMMEDIATELY (synchronous)
    // Radix UI AlertDialog locks body overflow, but may not restore it properly on optimistic close
    const originalOverflow = document.body.style.overflow || '';
    document.body.style.overflow = originalOverflow || '';
    document.body.style.pointerEvents = '';

    // ✅ CRITICAL FIX: Close dialog immediately (optimistic) before mutation starts
    // This prevents UI freeze by allowing dialog to close while mutation runs in background
    setShowLeaveApproveDialog(false);

    // ✅ CRITICAL FIX: Clear leave data immediately (synchronous, not deferred)
    setLeaveToApprove(null);

    // ✅ CRITICAL: Use requestAnimationFrame to ensure DOM updates happen immediately
    requestAnimationFrame(() => {
      // Force remove aria-hidden from root
      const root = document.getElementById('root');
      if (root && root.getAttribute('aria-hidden') === 'true') {
        root.removeAttribute('aria-hidden');
      }
      
      // Remove aria-hidden from any dialog containers
      const dialogs = document.querySelectorAll('[role="dialog"], [role="alertdialog"]');
      dialogs.forEach((dialog) => {
        if (dialog.getAttribute('aria-hidden') === 'true') {
          dialog.removeAttribute('aria-hidden');
        }
      });
      
      // Ensure body is fully unlocked
      document.body.style.overflow = originalOverflow || '';
      document.body.style.pointerEvents = '';
    });

    try {
      // Run mutation in background - don't await it to block UI
      // The mutation's onSuccess will handle query invalidation with proper delay
      approveLeaveMutation.mutate(id, {
        onError: (error) => {
          console.error("Error approving leave:", error);
          // Dialog already closed, error toast will be shown by mutation hook
        },
      });
    } catch (error) {
      console.error("Error approving leave:", error);
      // Error handling is done by mutation hook's onError
    }
  };

  const handleRejectLeave = async (id: number, reason: string) => {
    // ✅ CRITICAL FIX: Force remove aria-hidden from focused elements immediately
    const allElements = document.querySelectorAll('[aria-hidden="true"]');
    allElements.forEach((el) => {
      if (el.contains(document.activeElement)) {
        el.removeAttribute('aria-hidden');
      }
    });
    
    // ✅ CRITICAL FIX: Restore body overflow IMMEDIATELY (synchronous)
    // Radix UI AlertDialog locks body overflow, but may not restore it properly on optimistic close
    const originalOverflow = document.body.style.overflow || '';
    document.body.style.overflow = originalOverflow || '';
    document.body.style.pointerEvents = '';

    // ✅ CRITICAL FIX: Close dialog immediately (optimistic) before mutation starts
    // This prevents UI freeze by allowing dialog to close while mutation runs in background
    setShowLeaveRejectDialog(false);

    // ✅ CRITICAL FIX: Clear leave data and rejection reason immediately (synchronous, not deferred)
    setLeaveToReject(null);
    setRejectionReason("");

    // ✅ CRITICAL: Use requestAnimationFrame to ensure DOM updates happen immediately
    requestAnimationFrame(() => {
      // Force remove aria-hidden from root
      const root = document.getElementById('root');
      if (root && root.getAttribute('aria-hidden') === 'true') {
        root.removeAttribute('aria-hidden');
      }
      
      // Remove aria-hidden from any dialog containers
      const dialogs = document.querySelectorAll('[role="dialog"], [role="alertdialog"]');
      dialogs.forEach((dialog) => {
        if (dialog.getAttribute('aria-hidden') === 'true') {
          dialog.removeAttribute('aria-hidden');
        }
      });
      
      // Ensure body is fully unlocked
      document.body.style.overflow = originalOverflow || '';
      document.body.style.pointerEvents = '';
    });

    try {
      // Run mutation in background - don't await it to block UI
      // The mutation's onSuccess will handle query invalidation with proper delay
      rejectLeaveMutation.mutate(
        {
          id,
          data: { rejection_reason: reason },
        },
        {
          onError: (error) => {
            console.error("Error rejecting leave:", error);
            // Dialog already closed, error toast will be shown by mutation hook
          },
        }
      );
    } catch (error) {
      console.error("Error rejecting leave:", error);
      // Error handling is done by mutation hook's onError
    }
  };

  const handleViewLeave = (leave: EmployeeLeaveRead) => {
    setLeaveToView(leave);
    setShowLeaveViewDialog(true);
  };

  const handleCreateAdvance = async (data: AdvanceCreate) => {
    try {
      const createdAdvance = await createAdvanceMutation.mutateAsync(data);
      setShowAdvanceForm(false);

      // ✅ FIX: Use selective invalidation to prevent UI freeze
      invalidateQueriesSelective(advanceKeys.all, {
        refetchType: "none",
        delay: 0,
      });

      // Manually refetch with delay
      requestAnimationFrame(() => {
        setTimeout(() => {
          queryClient.refetchQueries({
            queryKey: advanceKeys.all,
            exact: false,
            type: "active",
          });
        }, 200);
      });

      // Return created advance for PDF generation
      return createdAdvance;
    } catch (error) {
      console.error("Error creating advance:", error);
      throw error;
    }
  };

  const handleUpdateAdvance = async (id: number, data: AdvanceUpdate) => {
    try {
      await updateAdvanceMutation.mutateAsync({ id, payload: data });
      setShowAdvanceForm(false);
      setIsEditingAdvance(false);

      // ✅ FIX: Use selective invalidation to prevent UI freeze
      invalidateQueriesSelective(advanceKeys.all, {
        refetchType: "none",
        delay: 0,
      });

      // Manually refetch with delay
      requestAnimationFrame(() => {
        setTimeout(() => {
          queryClient.refetchQueries({
            queryKey: advanceKeys.all,
            exact: false,
            type: "active",
          });
        }, 200);
      });
    } catch (error) {
      console.error("Error updating advance:", error);
    }
  };

  const handleUpdateAdvanceStatus = async (
    id: number,
    status: string,
    reason?: string
  ) => {
    try {
      const payload: AdvanceStatusUpdate = {
        status,
        ...(reason && { reason }),
      };
      await updateAdvanceStatusMutation.mutateAsync({ id, payload });
      setShowAdvanceStatusDialog(false);
      setAdvanceStatus("");
      setAdvanceStatusReason("");

      // ✅ FIX: Use selective invalidation to prevent UI freeze
      invalidateQueriesSelective(advanceKeys.all, {
        refetchType: "none",
        delay: 0,
      });

      // Manually refetch with delay
      requestAnimationFrame(() => {
        setTimeout(() => {
          queryClient.refetchQueries({
            queryKey: advanceKeys.all,
            exact: false,
            type: "active",
          });
        }, 200);
      });
    } catch (error) {
      console.error("Error updating advance status:", error);
    }
  };

  const handleUpdateAdvanceAmountPaid = async (id: number, amount: number) => {
    try {
      const payload: AdvanceAmountPaidUpdate = { amount_paid: amount };
      await updateAdvanceAmountPaidMutation.mutateAsync({
        id,
        payload,
      });
      setShowAdvanceAmountDialog(false);

      // ✅ FIX: Use selective invalidation to prevent UI freeze
      invalidateQueriesSelective(advanceKeys.all, {
        refetchType: "none",
        delay: 0,
      });

      // Manually refetch with delay
      requestAnimationFrame(() => {
        setTimeout(() => {
          queryClient.refetchQueries({
            queryKey: advanceKeys.all,
            exact: false,
            type: "active",
          });
        }, 200);
      });
    } catch (error) {
      console.error("Error updating advance amount:", error);
    }
  };

  return {
    // Data
    employees,
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
    totalAdvances,
    pendingAdvances,

    // UI State
    activeTab,
    setActiveTab,
    attendancePage,
    setAttendancePage,
    leavesPage,
    setLeavesPage,
    advancesPage,
    setAdvancesPage,
    attendanceMonth,
    setAttendanceMonth,
    attendanceYear,
    setAttendanceYear,
    leaveMonth,
    setLeaveMonth,
    leaveYear,
    setLeaveYear,
    pageSize,

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
