import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useTabNavigation } from "../use-tab-navigation";
import { toast } from "@/hooks/use-toast";
import { CacheUtils } from "@/lib/api";
import {
  useEmployeesByBranch,
  useEmployee,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
  useUpdateEmployeeStatus,
  employeeKeys,
} from "@/lib/hooks/general/useEmployees";
import {
  useAttendanceAll,
  useAttendance,
  useCreateAttendance,
  useUpdateAttendance,
  useUpdateIndividualAttendance,
  useDeleteAttendance,
  useAttendanceByBranch,
} from "@/lib/hooks/general/useEmployeeAttendance";
import { EmployeeAttendanceService } from "@/lib/services/general/employee-attendance.service";
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
} from "@/lib/hooks/general/useEmployeeLeave";
import {
  useAdvancesAll,
  useAdvancesByBranch,
  useAdvance,
  useCreateAdvance,
  useUpdateAdvance,
  useUpdateAdvanceStatus,
  useUpdateAdvanceAmountPaid,
  advanceKeys,
} from "@/lib/hooks/general/useAdvances";
import { EmployeeCreate, EmployeeUpdate } from "@/lib/types/general/employees";
import {
  EmployeeAttendanceCreate,
  EmployeeAttendanceUpdate,
} from "@/lib/types/general/employee-attendance";
import {
  EmployeeLeaveCreate,
  EmployeeLeaveUpdate,
  EmployeeLeaveReject,
} from "@/lib/types/general/employee-leave";
import { AdvanceCreate, AdvanceUpdate, AdvanceStatusUpdate, AdvanceAmountPaidUpdate } from "@/lib/types/general/advances";

// Types
export interface EmployeeRead {
  employee_id: number;
  employee_name: string;
  employee_code: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  date_of_joining: string;
  salary: number;
  status: "ACTIVE" | "TERMINATED";
  branch_id: number;
  created_at: string;
  updated_at: string;
}

export interface EmployeeAttendanceRead {
  attendance_id: number;
  employee_id: number;
  attendance_month: string; // YYYY-MM-DD
  total_working_days: number;
  days_present: number;
  days_absent: number;
  paid_leaves: number;
  unpaid_leaves: number;
  late_arrivals: number;
  early_departures: number;
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

export interface AdvanceRead {
  advance_id: number;
  employee_id: number;
  amount: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID";
  requested_date: string;
  approved_date?: string;
  paid_date?: string;
  amount_paid?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useEmployeeManagement = (
  viewMode: "branch" | "institute" = "branch"
) => {
  const queryClient = useQueryClient();
  const { user, currentBranch } = useAuthStore();
  const { activeTab, setActiveTab } = useTabNavigation("employees");

  // UI State - Initialize month/year to current values (required parameters)
  const now = new Date();
  const [attendancePage, setAttendancePage] = useState(1);
  const [leavesPage, setLeavesPage] = useState(1);
  const [advancesPage, setAdvancesPage] = useState(1);
  const [attendanceMonth, setAttendanceMonth] = useState<number>(now.getMonth() + 1);
  const [attendanceYear, setAttendanceYear] = useState<number>(now.getFullYear());
  const [leaveMonth, setLeaveMonth] = useState<number>(now.getMonth() + 1);
  const [leaveYear, setLeaveYear] = useState<number>(now.getFullYear());
  const pageSize = 20;

  // Data hooks
  const { data: employees = [], isLoading, error } = useEmployeesByBranch();
  const { data: attendanceData, isLoading: attendanceLoading } =
    useAttendanceByBranch(attendanceMonth, attendanceYear);
  const { data: leavesData, isLoading: leavesLoading } = useEmployeeLeavesByBranch(
    leaveMonth,
    leaveYear,
    pageSize,
    leavesPage,
    undefined // leaveStatus
  );

  // Extract data from response objects
  const attendance = attendanceData?.data || [];
  const leaves = leavesData?.data || [];
  const { data: advancesData, isLoading: advancesLoading } = useAdvancesByBranch();
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
  const [showAttendanceBulkCreateDialog, setShowAttendanceBulkCreateDialog] = useState(false);
  const [isBulkCreatingAttendance, setIsBulkCreatingAttendance] = useState(false);
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

  // Flatten and enrich attendance data with employee names
  const flattenedAttendance = attendance.flatMap(
    (monthGroup: any) => monthGroup.attendances || []
  );

  const enrichedAttendance = flattenedAttendance.map(
    (attendanceRecord: any) => {
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
    }
  );

  // Computed values
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(
    (emp) => emp.status === "ACTIVE"
  ).length;
  const totalAttendance = flattenedAttendance.length;
  const presentToday = 0; // Not applicable with monthly aggregates
  const pendingLeaves = leaves.filter(
    (leave: any) => leave.leave_status === "PENDING"
  ).length;
  const totalAdvances = Array.isArray(advances) ? advances.length : 0;
  const pendingAdvances = Array.isArray(advances)
    ? advances.filter((adv: any) => adv.status === "PENDING").length
    : 0;

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
      
      // Aggressive cache invalidation for immediate UI updates
      queryClient.removeQueries({ queryKey: employeeKeys.all });
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      await queryClient.refetchQueries({
        queryKey: employeeKeys.byBranch(),
        type: 'active'
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
      
      // Aggressive cache invalidation for immediate UI updates
      queryClient.removeQueries({ queryKey: employeeKeys.all });
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      await queryClient.refetchQueries({
        queryKey: employeeKeys.byBranch(),
        type: 'active'
      });
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    try {
      await deleteEmployeeMutation.mutateAsync(id);
      setShowDeleteEmployeeDialog(false);
      
      // Aggressive cache invalidation for immediate UI updates
      queryClient.removeQueries({ queryKey: employeeKeys.all });
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      await queryClient.refetchQueries({
        queryKey: employeeKeys.byBranch(),
        type: 'active'
      });
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  const handleUpdateEmployeeStatus = async (id: number, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
      
      // Aggressive cache invalidation for immediate UI updates
      queryClient.removeQueries({ queryKey: employeeKeys.all });
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      await queryClient.refetchQueries({
        queryKey: employeeKeys.byBranch(),
        type: 'active'
      });
    } catch (error) {
      console.error("Error updating employee status:", error);
    }
  };

  const handleCreateAttendance = async (data: { employee_id: number; total_working_days: number; month: number; year: number }) => {
    try {
      await EmployeeAttendanceService.create(data);
      setShowAttendanceForm(false);
      
      // Clear API cache for employee-attendances endpoints
      CacheUtils.clearByPattern(/GET:.*\/employee-attendances/i);
      
      // Aggressive cache invalidation for immediate UI updates
      // Invalidate all attendance-related queries using the proper key structure
      queryClient.removeQueries({ queryKey: ['employee-attendances'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['employee-attendances'], exact: false });
      await queryClient.refetchQueries({
        queryKey: ['employee-attendances'],
        exact: false,
        type: 'active'
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
        description: error?.message || "Failed to create attendance record. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleBulkCreateAttendance = async (data: { total_working_days: number; month: number; year: number }) => {
    setIsBulkCreatingAttendance(true);
    try {
      await EmployeeAttendanceService.createBulk(data);
      setShowAttendanceBulkCreateDialog(false);
      
      // Clear API cache for employee-attendances endpoints
      CacheUtils.clearByPattern(/GET:.*\/employee-attendances/i);
      
      // Aggressive cache invalidation for immediate UI updates
      // Invalidate all attendance-related queries using the proper key structure
      queryClient.removeQueries({ queryKey: ['employee-attendances'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['employee-attendances'], exact: false });
      
      // Force refetch active queries
      await queryClient.refetchQueries({
        queryKey: ['employee-attendances'],
        exact: false,
        type: 'active'
      });
      
      toast({
        title: "Bulk Attendance Created",
        description: "Attendance records have been created successfully for all active employees.",
        variant: "success",
      });
    } catch (error: any) {
      console.error("Error creating bulk attendance:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create bulk attendance records. Please try again.",
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
      
      // Clear API cache for employee-attendances endpoints
      CacheUtils.clearByPattern(/GET:.*\/employee-attendances/i);
      
      // Aggressive cache invalidation for immediate UI updates
      // Invalidate all attendance-related queries using the proper key structure
      queryClient.removeQueries({ queryKey: ['employee-attendances'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['employee-attendances'], exact: false });
      
      // Force refetch all active attendance queries
      await queryClient.refetchQueries({
        queryKey: ['employee-attendances'],
        exact: false,
        type: 'active'
      });
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  const handleUpdateAttendanceBulk = async (data: { total_working_days: number; month: number; year: number }) => {
    try {
      await EmployeeAttendanceService.updateBulk(data);
      setShowAttendanceForm(false);
      setIsEditingAttendance(false);
      
      // Clear API cache for employee-attendances endpoints
      CacheUtils.clearByPattern(/GET:.*\/employee-attendances/i);
      
      // Aggressive cache invalidation for immediate UI updates
      // Invalidate all attendance-related queries using the proper key structure
      queryClient.removeQueries({ queryKey: ['employee-attendances'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['employee-attendances'], exact: false });
      await queryClient.refetchQueries({
        queryKey: ['employee-attendances'],
        exact: false,
        type: 'active'
      });
      
      toast({
        title: "Attendance Updated",
        description: "Attendance records have been updated successfully for all employees in the branch.",
        variant: "success",
      });
    } catch (error: any) {
      console.error("Error updating attendance:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update attendance records. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteAttendance = async (id: number) => {
    try {
      await deleteAttendanceMutation.mutateAsync(id);
      setShowAttendanceDeleteDialog(false);
      
      // Clear API cache for employee-attendances endpoints
      CacheUtils.clearByPattern(/GET:.*\/employee-attendances/i);
      
      // Aggressive cache invalidation for immediate UI updates
      // Invalidate all attendance-related queries using the proper key structure
      queryClient.removeQueries({ queryKey: ['employee-attendances'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['employee-attendances'], exact: false });
      await queryClient.refetchQueries({
        queryKey: ['employee-attendances'],
        exact: false,
        type: 'active'
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
      
      // Aggressive cache invalidation for immediate UI updates
      // Step 1: Remove query data to force fresh fetch
      queryClient.removeQueries({ queryKey: employeeLeaveKeys.all });
      
      // Step 2: Invalidate all leave-related queries
      queryClient.invalidateQueries({ queryKey: employeeLeaveKeys.all });
      
      // Step 3: Force refetch active queries
      await queryClient.refetchQueries({
        queryKey: employeeLeaveKeys.all,
        type: 'active'
      });
      
      // Step 4: Wait for React to process state updates
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error("Error creating leave:", error);
    }
  };

  const handleUpdateLeave = async (id: number, data: EmployeeLeaveUpdate) => {
    try {
      await updateLeaveMutation.mutateAsync({ id, data });
      setShowLeaveForm(false);
      setIsEditingLeave(false);
      
      // Aggressive cache invalidation for immediate UI updates
      // Step 1: Remove query data to force fresh fetch
      queryClient.removeQueries({ queryKey: employeeLeaveKeys.all });
      
      // Step 2: Invalidate all leave-related queries
      queryClient.invalidateQueries({ queryKey: employeeLeaveKeys.all });
      
      // Step 3: Force refetch active queries
      await queryClient.refetchQueries({
        queryKey: employeeLeaveKeys.all,
        type: 'active'
      });
      
      // Step 4: Wait for React to process state updates
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error("Error updating leave:", error);
    }
  };

  const handleDeleteLeave = async (id: number) => {
    try {
      await deleteLeaveMutation.mutateAsync(id);
      setShowLeaveDeleteDialog(false);
      
      // Aggressive cache invalidation for immediate UI updates
      // Step 1: Remove query data to force fresh fetch
      queryClient.removeQueries({ queryKey: employeeLeaveKeys.all });
      
      // Step 2: Invalidate all leave-related queries
      queryClient.invalidateQueries({ queryKey: employeeLeaveKeys.all });
      
      // Step 3: Force refetch active queries
      await queryClient.refetchQueries({
        queryKey: employeeLeaveKeys.all,
        type: 'active'
      });
      
      // Step 4: Wait for React to process state updates
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error("Error deleting leave:", error);
    }
  };

  const handleApproveLeave = async (id: number, notes?: string) => {
    try {
      await approveLeaveMutation.mutateAsync(id);
      
      // Close dialog immediately to prevent UI freeze
      setShowLeaveApproveDialog(false);
      
      // Clear API cache first (non-blocking)
      try {
        CacheUtils.clearByPattern(/GET:.*\/employee-leave/i);
      } catch (error) {
        console.warn('Failed to clear API cache:', error);
      }
      
      // Invalidate and refetch queries asynchronously (non-blocking)
      // This allows the UI to remain responsive
      queryClient.removeQueries({ queryKey: employeeLeaveKeys.all });
      queryClient.invalidateQueries({ queryKey: employeeLeaveKeys.all }).catch(console.error);
      
      // Refetch in background without blocking
      queryClient.refetchQueries({
        queryKey: employeeLeaveKeys.all,
        type: 'active'
      }).catch(console.error);
    } catch (error) {
      console.error("Error approving leave:", error);
      // Ensure dialog is closed even on error
      setShowLeaveApproveDialog(false);
    }
  };

  const handleRejectLeave = async (id: number, reason: string) => {
    try {
      await rejectLeaveMutation.mutateAsync({
        id,
        data: { rejection_reason: reason },
      });
      
      // Close dialog immediately to prevent UI freeze
      setShowLeaveRejectDialog(false);
      
      // Clear API cache first (non-blocking)
      try {
        CacheUtils.clearByPattern(/GET:.*\/employee-leave/i);
      } catch (error) {
        console.warn('Failed to clear API cache:', error);
      }
      
      // Invalidate and refetch queries asynchronously (non-blocking)
      // This allows the UI to remain responsive
      queryClient.removeQueries({ queryKey: employeeLeaveKeys.all });
      queryClient.invalidateQueries({ queryKey: employeeLeaveKeys.all }).catch(console.error);
      
      // Refetch in background without blocking
      queryClient.refetchQueries({
        queryKey: employeeLeaveKeys.all,
        type: 'active'
      }).catch(console.error);
    } catch (error) {
      console.error("Error rejecting leave:", error);
      // Ensure dialog is closed even on error
      setShowLeaveRejectDialog(false);
    }
  };

  const handleViewLeave = (leave: EmployeeLeaveRead) => {
    setLeaveToView(leave);
    setShowLeaveViewDialog(true);
  };

  const handleCreateAdvance = async (data: AdvanceCreate) => {
    try {
      await createAdvanceMutation.mutateAsync(data);
      setShowAdvanceForm(false);
      
      // Aggressive cache invalidation for immediate UI updates
      queryClient.removeQueries({ queryKey: advanceKeys.all });
      queryClient.invalidateQueries({ queryKey: advanceKeys.all });
      await queryClient.refetchQueries({
        queryKey: advanceKeys.all,
        type: 'active'
      });
    } catch (error) {
      console.error("Error creating advance:", error);
    }
  };

  const handleUpdateAdvance = async (id: number, data: AdvanceUpdate) => {
    try {
      await updateAdvanceMutation.mutateAsync({ id, payload: data });
      setShowAdvanceForm(false);
      setIsEditingAdvance(false);
      
      // Aggressive cache invalidation for immediate UI updates
      queryClient.removeQueries({ queryKey: advanceKeys.all });
      queryClient.invalidateQueries({ queryKey: advanceKeys.all });
      await queryClient.refetchQueries({
        queryKey: advanceKeys.all,
        type: 'active'
      });
    } catch (error) {
      console.error("Error updating advance:", error);
    }
  };

  const handleUpdateAdvanceStatus = async (id: number, status: string, reason?: string) => {
    try {
      const payload: AdvanceStatusUpdate = { 
        status,
        ...(reason && { reason })
      };
      await updateAdvanceStatusMutation.mutateAsync({ id, payload });
      setShowAdvanceStatusDialog(false);
      setAdvanceStatus("");
      setAdvanceStatusReason("");
      
      // Aggressive cache invalidation for immediate UI updates
      queryClient.removeQueries({ queryKey: advanceKeys.all });
      queryClient.invalidateQueries({ queryKey: advanceKeys.all });
      await queryClient.refetchQueries({
        queryKey: advanceKeys.all,
        type: 'active'
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
      
      // Aggressive cache invalidation for immediate UI updates
      queryClient.removeQueries({ queryKey: advanceKeys.all });
      queryClient.invalidateQueries({ queryKey: advanceKeys.all });
      await queryClient.refetchQueries({
        queryKey: advanceKeys.all,
        type: 'active'
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
  };
};
